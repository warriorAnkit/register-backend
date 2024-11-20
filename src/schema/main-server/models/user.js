/* eslint-disable no-useless-escape */

const { Model, NOW } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model { }

  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
      unique: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.ENUM('SUPER_ADMIN', 'SYSTEM_ADMIN', 'USER', 'CHECKLIST_MAKER', 'EXTERNAL_AUDITOR')),
      defaultValue: [],
    },
    phoneNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.TEXT,
    },
    isDisabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    forcePasswordReset: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    numberVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    failedAttemptAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failedAttemptCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ratingRemark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    indexes: [
      {
        fields: ['created_at'],
      },
      {
        fields: ['name', 'email', 'phone_no'],
        method: 'gin',
      },
    ],
    hooks: {
      beforeCount(options) {
        options.raw = true;
      },
      beforeCreate(user) {
        user.createdAt = NOW(); // Set createdAt to current date/time
        user.updatedAt = NOW(); // Set updatedAt to current date/time
      },
      beforeUpdate(user) {
        user.updatedAt = NOW(); // Update updatedAt to current date/time
      },
    },
    sequelize,
    modelName: 'User',
    tableName: 'user',
    underscored: true,
    paranoid: true,
    timestamps: true,
  });

  User.associate = models => {
    User.hasMany(models.User, {
      as: 'creator',
      foreignKey: 'createdBy',
      sourceKey: 'id',
      onDelete: 'RESTRICT',
    });

    User.hasMany(models.ProjectUser, {
      as: 'projectUsers',
      foreignKey: 'userId',
      sourceKey: 'id',
      onDelete: 'RESTRICT',
    });
  };

  return User;
};
