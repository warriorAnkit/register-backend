/* eslint-disable max-lines */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { pubsub, pubsubEvents } = require('../../../../pubsub');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const postLogger = require('../../register-logger');

const replaceFieldNamesWithIds = (formula, fieldNameToIdMap) => formula.replace(/"([^"]*)"/g, (match, fieldName) => {
  if (fieldNameToIdMap[fieldName]) {
    return fieldNameToIdMap[fieldName];
  }
  // If the field name doesn't exist in the map, throw an error
  throw new Error(`Field "${fieldName}" does not exist or is invalid.`);
});

const updateTemplate = async (parent, args, ctx) => {
  const {
    requestMeta, req, localeService, models,
  } = ctx;

  try {
    const { Template: TemplateModel, TemplateActivityLog } = models;
    const { user } = req;
    const {
      id, name, fields, properties,
    } = args;
    // console.log(fields);

    if (user.role === 'USER') {
      throw new CustomGraphqlError(getMessage('TEMPLATE_UPDATE_PERMISSION_ERROR', localeService));
    }

    const template = await TemplateModel.findByPk(id, { raw: true });
    if (!template) {
      throw new CustomGraphqlError(getMessage('TEMPLATE_NOT_FOUND', localeService));
    }
    const allFields = [];
    const isDraft = template.status === 'DRAFT';

    if (name && name !== template.name) {
      await TemplateActivityLog.create({
        userId: user.id,
        templateId: id,
        actionType: 'UPDATE_TEMPLATE',
        entityType: 'TEMPLATE',
        entityId: id,
        changes: { from: template.name, to: name },
      });
    }

    const updatedData = {
      name: name || template.name,
      updatedById: user.id,
    };

    await TemplateModel.update(updatedData, { where: { id: template.id } });

    const existingFields = await models.TableField.findAll({ where: { templateId: id } });
    const existingProperties = await models.TemplateProperty.findAll({ where: { templateId: id } });

    const fieldIds = fields ? fields.map(f => parseInt(f.id, 10)).filter(Boolean) : [];
    const propertyIds = properties ? properties.map(p => parseInt(p.id, 10)).filter(Boolean) : [];

    for (const existingField of existingFields) {
      if (!fieldIds.includes(parseInt(existingField.id, 10))) {
        if (isDraft) {
          await models.TableField.destroy({ where: { id: existingField.id }, force: true });
        } else {
          await models.TableField.destroy({ where: { id: existingField.id } });
        }

        await TemplateActivityLog.create({
          userId: user.id,
          templateId: id,
          actionType: 'DELETE_TEMPLATE',
          entityType: 'FIELD',
          entityId: existingField.id,
          changes: { from: existingField, to: null },
        });
      }
    }

    if (fields) {
      await Promise.all(fields.map(async field => {
        if (field.id) {
          allFields.push(field);
          const existingField = await models.TableField.findByPk(field.id);
          if (existingField) {
            const oldFieldData = existingField.toJSON();
            const fieldChanges = {};
            Object.keys(field).forEach(key => {
              if (field[key] !== oldFieldData[key]) {
                fieldChanges[key] = { from: oldFieldData[key], to: field[key] };
              }
            });
            // eslint-disable-next-line no-console
            console.log(fieldChanges);
            if (Object.keys(fieldChanges).length > 0) {
              await existingField.update(field);

              await TemplateActivityLog.create({
                userId: user.id,
                templateId: id,
                actionType: 'UPDATE_TEMPLATE',
                entityType: 'FIELD',
                entityId: field.id,
                changes: { from: oldFieldData, to: field },
              });
            }
          }
        } else {
          const newField = await models.TableField.create({ ...field, templateId: template.id }, { raw: true });

          await TemplateActivityLog.create({
            userId: user.id,
            templateId: id,
            actionType: 'CREATE_TEMPLATE',
            entityType: 'FIELD',
            entityId: newField.id,
            changes: { from: null, to: field },
          });
          console.log('newly create d field', newField.dataValues);
          allFields.push(newField.dataValues);
          console.log(allFields);
        }
      }));
    }
    for (const existingProperty of existingProperties) {
      if (!propertyIds.includes(parseInt(existingProperty.id, 10))) {
        if (isDraft) {
          await models.TemplateProperty.destroy({ where: { id: existingProperty.id }, force: true });
        } else {
          await models.TemplateProperty.destroy({ where: { id: existingProperty.id } });
        }

        await TemplateActivityLog.create({
          userId: user.id,
          templateId: id,
          actionType: 'DELETE_TEMPLATE',
          entityType: 'PROPERTY',
          entityId: existingProperty.id,
          changes: { from: existingProperty, to: null },
        });
      }
    }

    if (properties) {
      await Promise.all(properties.map(async property => {
        if (property.id) {
          const existingProperty = await models.TemplateProperty.findByPk(property.id);
          if (existingProperty) {
            const oldPropertyData = existingProperty.toJSON();
            const propertyChanges = {};
            Object.keys(property).forEach(key => {
              if (property[key] !== oldPropertyData[key]) {
                propertyChanges[key] = { from: oldPropertyData[key], to: property[key] };
              }
            });

            if (Object.keys(propertyChanges).length > 0) {
              await existingProperty.update(property);

              await TemplateActivityLog.create({
                userId: user.id,
                templateId: id,
                actionType: 'UPDATE_TEMPLATE',
                entityType: 'PROPERTY',
                entityId: property.id,
                changes: { from: oldPropertyData, to: property },
              });
            }
          }
        } else {
          const newProperty = await models.TemplateProperty.create({ ...property, templateId: template.id });

          await TemplateActivityLog.create({
            userId: user.id,
            templateId: id,
            actionType: 'CREATE_TEMPLATE',
            entityType: 'PROPERTY',
            entityId: newProperty.id,
            changes: { from: null, to: property },
          });
        }
      }));
    }

    const updatedTemplate = await TemplateModel.findByPk(template.id, {
      // eslint-disable-next-line max-lines
      include: [
        { model: models.TableField, as: 'fields' },
        { model: models.TemplateProperty, as: 'properties' },
      ],
    });

    const fieldNameToIdMap = {};
    for (const field of allFields) {
      fieldNameToIdMap[field.fieldName] = field.id;
    }

    for (const field of fields) {
      if (field.fieldType === 'CALCULATION' && field.options) {
        const formulaWithIds = replaceFieldNamesWithIds(
          field.options[0],
          fieldNameToIdMap,
        );
        // console.log(formulaWithIds);
        await models.TableField.update(
          { options: [formulaWithIds] }, // Updating the options array with the new formula
          { where: { id: fieldNameToIdMap[field.fieldName] } },
        );
      }
    }
    // console.log(fieldNameToIdMap);
    const response = {
      data: updatedTemplate,
      message: getMessage('TEMPLATE_UPDATE_SUCCESS', localeService, { name: updatedTemplate.name }),
    };

    pubsub.publish(pubsubEvents.TEMPLATE_UPDATED, { templateUpdated: { data: updatedTemplate } });
    return response;
  } catch (err) {
    postLogger.error(`Error from updateTemplate resolver => ${err}`, requestMeta);
    throw err;
  }
};
module.exports = updateTemplate;
