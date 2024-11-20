const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class ProjectUser extends Model {
    // Method to get project ID for a specific user
    static async getProjectId(userId, models) {
      try {
        const projectUser = await models.ProjectUser.findOne({
          where: { userId },
          attributes: ['projectId'],
          raw: true, // Only select the projectId field
        });
        // console.log(projectUser.projectId);
        return projectUser ? projectUser.projectId : null; // Return the projectId or null if not found
      } catch (error) {
        console.error(`Error fetching project ID for user ${userId}:`, error);
        throw error; // Propagate the error for handling by the caller
      }
    }
  }

  ProjectUser.init({
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    roles: {
      type: DataTypes.ENUM('FORM_CREATOR', 'FILLER', 'ADMIN', 'USER'),
      defaultValue: 'FILLER',
    },
  }, {
    sequelize,
    modelName: 'ProjectUser',
    tableName: 'project_user',
    underscored: true,
    paranoid: true, // Enables soft deletes
    timestamps: true, // Automatically manages createdAt and updatedAt
    hooks: {
      beforeCreate(instance) {
        instance.createdAt = new Date(); // Set createdAt to current date/time
        instance.updatedAt = new Date(); // Set updatedAt to current date/time
      },
      beforeUpdate(instance) {
        instance.updatedAt = new Date(); // Update updatedAt to current date/time
      },
    },
    indexes: [
      {
        fields: ['project_id', 'user_id'],
        unique: true,
      },
    ],
  });

  ProjectUser.associate = models => {
    ProjectUser.belongsTo(models.Person, {
      as: 'creator',
      foreignKey: 'createdBy',
      targetKey: 'id',
    });
    ProjectUser.belongsTo(models.Person, {
      as: 'user',
      foreignKey: 'userId',
      targetKey: 'id',
    });
  };

  return ProjectUser;
};
