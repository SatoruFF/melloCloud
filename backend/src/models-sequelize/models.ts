// import { pool } from "./db.js";
// import { DataTypes } from "sequelize";


// // User data table
// export const User = pool.define('user', {
//     id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
//     userName: {type: DataTypes.STRING, allowNull: true},
//     email: {type: DataTypes.STRING, unique: true, allowNull: false},
//     password: {type: DataTypes.STRING, allowNull: false},
//     diskSpace: {type: DataTypes.BIGINT, defaultValue: 100*1024*1024},
//     usedSpace: {type: DataTypes.INTEGER, defaultValue: 0},
//     avatar: {type: DataTypes.STRING},
//     role: {type: DataTypes.STRING, defaultValue: "USER"},
//     isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
//     activationLink: {type: DataTypes.STRING},
//     refreshToken: {type: DataTypes.STRING},
// })

// // File data table
// export const File = pool.define('file', {
//     id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
//     name: {type: DataTypes.STRING, allowNull: false},
//     type: {type: DataTypes.STRING},
//     access_link: {type: DataTypes.STRING},
//     size: {type: DataTypes.INTEGER, defaultValue: 0},
//     path: {type: DataTypes.STRING, defaultValue: ''},
//     url: {type: DataTypes.STRING, defaultValue: ''},
//     parentId: {type: DataTypes.INTEGER, allowNull: true, defaultValue: null, references: {model: 'File', key: 'id'}}
// })

// // Relation - one-to-many(one user can have many files)
// User.hasMany(File)
// File.belongsTo(User)


// // Relation - many-to-one (many files can be located in one folder)
// File.belongsTo(File, { as: 'parent', foreignKey: 'parentId' });
// File.hasMany(File, { as: 'child', foreignKey: 'childId' });