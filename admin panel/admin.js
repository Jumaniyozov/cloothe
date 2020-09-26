const AdminBro = require('admin-bro')
const AdminBroExpress = require('@admin-bro/express')
const AdminBroSequelize = require('@admin-bro/sequelize')
const MySQL = require('./../src/helpers/mysqlUtils');

// Models

const Catalogue = require('./../src/models/Catalogue');
const Questions = require('./../src/models/Questions');
const HotQuestions = require('./../src/models/HotQuestions');
const ClotheVariation = require('./../src/models/ClotheVariation');
const ClotheMaterials = require('./../src/models/ClotheMaterials');
const ClotheSizes = require('./../src/models/ClotheSizes');
const PrintingDetails = require('./../src/models/PrintingDetails');

AdminBro.registerAdapter(AdminBroSequelize)

const express = require('express')
const app = express()

const adminBro = new AdminBro({
    databases: [MySQL],
    resources: [
        Catalogue, Questions, HotQuestions,
        ClotheVariation, ClotheMaterials,
        ClotheSizes, PrintingDetails],
    rootPath: '/admin',
})

const router = AdminBroExpress.buildRouter(adminBro)

app.use(adminBro.options.rootPath, router)

module.exports = app;
