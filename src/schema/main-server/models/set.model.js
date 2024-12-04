const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Set extends Model {}

  Set.init({
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    submissionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

  }, {
    sequelize,
    modelName: 'Set',
    tableName: 'set',
    underscored: true,
    paranoid: true,
    timestamps: true,
  });

  Set.associate = models => {
    Set.belongsTo(models.Template, {
      foreignKey: 'templateId',
      targetKey: 'id',
    });
  };

  return Set;
};
