// models/TemplateProperty.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TemplateProperty extends Model { }

  TemplateProperty.init({
    propertyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    propertyFieldType: {
      type: DataTypes.ENUM(
        'TEXT',
        'MULTI_LINE_TEXT',
        'OPTIONS',
        'CHECKBOXES',
        'NUMERIC',
        'DATE',
        'ATTACHMENT',
        'CALCULATION',
      ),
      allowNull: false,
    },
    maxLength: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true, // Only for 'OPTIONS' or 'CHECKBOXES'
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Set the default value to true
    },
  }, {
    sequelize,
    modelName: 'TemplateProperty',
    tableName: 'template_property',
    underscored: true,
    paranoid: true,
    timestamps: true,
  });

  TemplateProperty.associate = models => {
    TemplateProperty.belongsTo(models.Template, {
      as: 'template',
      foreignKey: 'templateId',
      targetKey: 'id',
    });
  };

  return TemplateProperty;
};
