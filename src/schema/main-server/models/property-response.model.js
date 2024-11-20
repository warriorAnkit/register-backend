const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PropertyResponse extends Model {}

  PropertyResponse.init({
    setId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'template_property', // Use the actual table name here
        key: 'id',
      },
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'PropertyResponse',
    tableName: 'property_response',
    underscored: true,
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['set_id', 'property_id'], // Use snake_case
      },
    ],
  });

  PropertyResponse.associate = models => {
    PropertyResponse.belongsTo(models.Set, {
      foreignKey: 'setId',
      targetKey: 'id',
    });
    PropertyResponse.belongsTo(models.Template, {
      foreignKey: 'templateId',
      targetKey: 'id',
    });
    PropertyResponse.belongsTo(models.TemplateProperty, {
      foreignKey: 'propertyId',
      targetKey: 'id',
    });
    PropertyResponse.belongsTo(models.Person, {
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };

  return PropertyResponse;
};
