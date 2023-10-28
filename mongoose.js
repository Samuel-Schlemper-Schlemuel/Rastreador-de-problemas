'use strict'

require('dotenv').config()
const { expect } = require('chai')
const mongoose = require('mongoose')
const URI = process.env.MONGO_URI

mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})

const issueSchma = new mongoose.Schema({
    issue: Object,
    project: String
})

const issueModel = mongoose.model('issue', issueSchma)

function saveIssue(object, project){
    object.open = true
    object.created_on = new Date()
    object.updated_on = object.created_on

    let issue = new issueModel({
        issue: object,
        project: project
    })

    issue.save()
    object._id = issue._id
    return object
}

async function getIssues(project){
    let objects

    await issueModel.find({
        project: project
    })
    .then(doc => {
        objects = doc
    })
    .catch(err => {
        return 'error'
    })

    return objects
}

async function putIssue(id, project, object){
    let updated_on = new Date()
    object['updated_on'] = updated_on
    let projects = await getIssues(project)
    
    for(let i in projects){
        if(projects[i]['_id'] == id){
            object['created_on'] = projects[i]['issue']['created_on']

            if(object.issue_title == undefined){
                object.issue_title = projects[i]['issue']['issue_title']
            }
            if(object.issue_text == undefined){
                object.issue_text = projects[i]['issue']['issue_text']
            }
            if(object.created_by == undefined){
                object.created_by = projects[i]['issue']['created_by']
            }
            if(object.assigned_to == undefined){
                object.assigned_to = projects[i]['issue']['assigned_to']
            }
            if(object.status_text == undefined){
                object.status_text = projects[i]['issue']['status_text']
            }
            if(object.open == undefined){
                object.open = projects[i]['issue']['open']
            }
        }
    }

    let count = await issueModel.updateOne({'_id': id, project: project}, {$set: {issue: object}})

    if(count.modifiedCount > 0){
        return {'result': 'successfully updated', '_id': id}
    } else {
        return {error: 'could not update', '_id': id}
    }
    
}

async function deleteIssue(id, project){
    let count = await issueModel.deleteOne({
        '_id': id,
        project: project
    })
    
    if(count.deletedCount > 0){
        return {result: 'successfully deleted', '_id': id}
    } else {
        return {error: 'could not delete', '_id': id}
    }
    
}

module.exports = {saveIssue, getIssues, putIssue, deleteIssue}
