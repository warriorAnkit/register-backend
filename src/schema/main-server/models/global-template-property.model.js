const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GlobalTemplateProperty extends Model { }

  GlobalTemplateProperty.init({
    propertyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    propertyFieldType: {
      type: DataTypes.ENUM('TEXT', 'MULTI_LINE_TEXT', 'OPTIONS', 'CHECKBOXES', 'NUMERIC', 'DATE_PICKER', 'ATTACHMENT'),
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
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    globalTemplateId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'global_template',
        key: 'id',
      },
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'GlobalTemplateProperty',
    tableName: 'global_template_property',
    underscored: true,
    timestamps: true,
  });

  GlobalTemplateProperty.associate = models => {
    GlobalTemplateProperty.belongsTo(models.GlobalTemplate, {
      foreignKey: 'globalTemplateId',
      as: 'globalTemplate',
    });
  };

  return GlobalTemplateProperty;
};
