// const {
//   Op,
//   literal,
// } = require('sequelize');

// const CustomGraphqlError = require('../../../../shared-lib/error-handler');
// const { getMessage } = require('../../../../utils/messages');
// const postLogger = require('../../register-logger');

// const getTemplatesWithPagination = async (parent, args, ctx) => {
//   const { requestMeta, localeService, models } = ctx;
//   const {
//     projectId, page = 1, pageSize = 10, searchQuery, filters,
//   } = args;
//   console.log(args);
//   try {
//     // Check if the projectId is provided
//     if (!projectId) {
//       throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
//     }

//     // Construct where clause for filtering
//     const whereClause = { projectId };
//     console.log(filters);
//     // Add filters if provided
//     if (filters) {
//       Object.keys(filters).forEach(key => {
//         whereClause[key] = filters[key];
//       });
//     }

//     // Add search query if provided
//     if (searchQuery) {
//       whereClause.name = {
//         [Op.iLike]: `%${searchQuery}%`, // Case-insensitive search
//       };
//     }

//     // Fetch templates with pagination and additional attributes
//     const offset = (page - 1) * pageSize;
//     const { count, rows: templates } = await models.Template.findAndCountAll({
//       where: whereClause,
//       attributes: {
//         include: [
//           [
//             literal(`(SELECT COUNT(DISTINCT s.id)
//                       FROM "set" s
//                       WHERE s.template_id = "Template".id)`),
//             'numberOfSets',
//           ],
//           [
//             literal(`(SELECT COUNT(DISTINCT CONCAT(fieldResponses.set_id, '-', fieldResponses.row_number))
//                       FROM "field_response" AS fieldResponses
//                       WHERE fieldResponses.template_id = "Template".id)`),
//             'numberOfEntries',
//           ],
//         ],
//       },
//       limit: pageSize,
//       offset,
//       order: [['createdAt', 'DESC']], // Sort by createdAt in descending order
//       raw: true,
//     });

//     // Return paginated response
//     return {
//       total: count,
//       page,
//       pageSize,
//       templates,
//     };
//   } catch (error) {
//     postLogger.error(`Error from getTemplatesWithPagination resolver => ${error.message}`, requestMeta);
//     console.log(error);
//     throw new CustomGraphqlError(error.message || 'INTERNAL_SERVER_ERROR');
//   }
// };

// module.exports = getTemplatesWithPagination;
