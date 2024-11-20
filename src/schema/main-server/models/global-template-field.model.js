const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GlobalTemplateField extends Model { }

  GlobalTemplateField.init({
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fieldType: {
      type: DataTypes.ENUM('TEXT', 'MULTI_LINE_TEXT', 'OPTIONS', 'CHECKBOXES', 'NUMERIC', 'DATE_PICKER', 'ATTACHMENT', 'CALCULATION'),
      allowNull: false,
    },
    maxLength: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING), // For fields with options like dropdowns or checkboxes
      allowNull: true,
    },
    globalTemplateId: { // Foreign key to the global template
      type: DataTypes.INTEGER,
      references: {
        model: 'global_template',
        key: 'id',
      },
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'GlobalTemplateField',
    tableName: 'global_template_field',
    underscored: true,
    timestamps: true,
  });

  GlobalTemplateField.associate = models => {
    GlobalTemplateField.belongsTo(models.GlobalTemplate, {
      foreignKey: 'globalTemplateId',
      as: 'globalTemplate',
    });
  };

  return GlobalTemplateField;
};
