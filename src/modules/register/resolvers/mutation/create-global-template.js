/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const createGlobalTemplate = async (parent, args, ctx) => {
  const {
    requestMeta, localeService, models,
  } = ctx;

  try {
    const { GlobalTemplate: GlobalTemplateModel } = models;
    const db = models;
    const {
      name, description, fields, properties,
    } = args;

    const globalTemplate = await GlobalTemplateModel.create({
      name,
      description,

    });

    // Create associated fields for the global template
    // eslint-disable-next-line no-restricted-syntax
    for (const field of fields) {
      await db.GlobalTemplateField.create({
        ...field,
        globalTemplateId: globalTemplate.id,
      });
    }

    // Create associated properties for the global template
    for (const property of properties) {
      await db.GlobalTemplateProperty.create({
        ...property,
        globalTemplateId: globalTemplate.id,
      });
    }

    // Fetch the newly created global template with its fields and properties
    const createdGlobalTemplate = await GlobalTemplateModel.findByPk(globalTemplate.id, {
      include: [
        { model: models.GlobalTemplateField, as: 'fields' },
        { model: models.GlobalTemplateProperty, as: 'properties' },
      ],
    });

    const response = {
      data: createdGlobalTemplate,
      message: getMessage('GLOBAL_TEMPLATE_CREATE_SUCCESS', localeService, { name: createdGlobalTemplate.name }),
    };

    return response;
  } catch (err) {
    postLogger.error(`Error from createGlobalTemplate resolver => ${err}`, requestMeta);
    throw err;
  }
};

module.exports = createGlobalTemplate;
