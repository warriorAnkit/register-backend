const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FieldResponse extends Model {}

  FieldResponse.init({
    setId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fieldId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rowNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    sequelize,
    modelName: 'FieldResponse',
    tableName: 'field_response',
    underscored: true,
    paranoid: true,
    timestamps: true,
  });

  FieldResponse.associate = models => {
    FieldResponse.belongsTo(models.Set, {
      foreignKey: 'setId',
      targetKey: 'id',
    });
    FieldResponse.belongsTo(models.Template, {
      foreignKey: 'templateId',
      targetKey: 'id',
    });
    FieldResponse.belongsTo(models.TableField, {
      foreignKey: 'fieldId',
      targetKey: 'id',
    });
  };

  return FieldResponse;
};
