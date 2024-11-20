// models/TableField.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TableField extends Model { }

  TableField.init({
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fieldType: {
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
    modelName: 'TableField',
    tableName: 'table_field',
    underscored: true,
    paranoid: true,
    timestamps: true,
  });

  TableField.associate = models => {
    TableField.belongsTo(models.Template, {
      as: 'template',
      foreignKey: 'templateId',
      targetKey: 'id',
    });
  };

  return TableField;
};
