/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable no-case-declarations */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */
const {
  GraphQLError,
  Kind,
} = require('graphql');

function arrify(value) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value[Symbol.iterator] === 'function') {
    return [...value];
  }

  return [value];
}

/**
 * Creates a validator for the GraphQL query depth
 * @param {Number} maxDepth - The maximum allowed depth for any operation in a GraphQL document.
 * @param {Object} [options]
 * @param {String|RegExp|Function} options.ignore - Stops recursive depth checking based on a field name. Either a string or regexp to match the name, or a function that returns a boolean.
 * @param {Function} [callback] - Called each time validation runs. Receives an Object which is a map of the depths for each operation.
 * @returns {Function} The validator function for GraphQL validation phase.
 */
const depthLimit = (maxDepth, options = {}, callback = () => { }) => validationContext => {
  try {
    const { definitions } = validationContext.getDocument();
    const fragments = getFragments(definitions);
    const queries = getQueriesAndMutations(definitions);
    const queryDepths = {};
    for (const name in queries) {
      queryDepths[name] = determineDepth(queries[name], fragments, 0, maxDepth, validationContext, name, options);
    }
    callback(queryDepths);
    return validationContext;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = depthLimit;

function getFragments(definitions) {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      map[definition.name.value] = definition;
    }
    return map;
  }, {});
}

// this will actually get both queries and mutations. we can basically treat those the same
function getQueriesAndMutations(definitions) {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      map[definition.name ? definition.name.value : ''] = definition;
    }
    return map;
  }, {});
}

function determineDepth(node, fragments, depthSoFar, maxDepth, context, operationName, options) {
  if (depthSoFar > maxDepth) {
    return context.reportError(
      new GraphQLError('INVALID REQUEST', [node]),
    );
  }

  switch (node.kind) {
    case Kind.FIELD:
      // by default, ignore the introspection fields which begin with double underscores
      const shouldIgnore = /^__/.test(node.name.value) || seeIfIgnored(node, options.ignore);

      if (shouldIgnore || !node.selectionSet) {
        return 0;
      }
      return 1 + Math.max(...node.selectionSet.selections.map(selection => determineDepth(selection, fragments, depthSoFar + 1, maxDepth, context, operationName, options)));
    case Kind.FRAGMENT_SPREAD:
      return determineDepth(fragments[node.name.value], fragments, depthSoFar, maxDepth, context, operationName, options);
    case Kind.INLINE_FRAGMENT:
    case Kind.FRAGMENT_DEFINITION:
    case Kind.OPERATION_DEFINITION:
      return Math.max(...node.selectionSet.selections.map(selection => determineDepth(selection, fragments, depthSoFar, maxDepth, context, operationName, options)));
    default:
      throw new Error(`uh oh! depth crawler cannot handle: ${node.kind}`);
  }
}

function seeIfIgnored(node, ignore) {
  for (const rule of arrify(ignore)) {
    const fieldName = node.name.value;
    switch (rule.constructor) {
      case Function:
        if (rule(fieldName)) {
          return true;
        }
        break;
      case String:
      case RegExp:
        if (fieldName.match(rule)) {
          return true;
        }
        break;
      default:
        throw new Error(`Invalid ignore option: ${rule}`);
    }
  }
  return false;
}
