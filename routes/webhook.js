const router = require("express").Router();
const express = require("express");
const  webhookController  = require("../controllers/webhook/webhook.controller");


router.post("/",webhookController)

module.exports=router