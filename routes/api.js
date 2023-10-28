'use strict'

const mongo = require('../mongoose')

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project
      let objects = []
      let objectOriginal = await mongo.getIssues(project)
      
      for(let i in objectOriginal){
        objects.push(objectOriginal[i].issue)
        objects[i]['_id'] = objectOriginal[i]['_id']
      }  
      
      for(let i in objects){
         if(objects[i]['assigned_to'] == undefined){
          objects[i]['assigned_to'] = ''
        }
        if(objects[i]['status_text'] == undefined){
          objects[i]['status_text'] = ''
        }
      }

      if(Object.keys(req.query).length > 0){
        for(let i in req.query){
            objects = objects.filter(e => {
              if(e[i] + '' == req.query[i]){
                return e
              }
            })
        }
      }

      return res.json(objects)
    })
    
    .post(async function (req, res){
      let project = req.params.project

      if(req.body.issue_title == undefined){
        return res.json({ error: 'required field(s) missing' })
      } else if (req.body.issue_text == undefined){
        return res.json({ error: 'required field(s) missing' })
      } else if (req.body.created_by == undefined){
        return res.json({ error: 'required field(s) missing' })
      }

      if(req.body['assigned_to'] == undefined){
        req.body['assigned_to'] = ''
      }
      if(req.body['status_text'] == undefined){
        req.body['status_text'] = ''
      }
      
      let result = await mongo.saveIssue(req.body, project)
      
      return res.json(result)
    })
    
    .put(async function (req, res){
      const project = req.params.project
      const id = req.body['_id']
      let object = req.body
      delete object['_id']

      if(id == '' || id == undefined){
        res.json({ error: 'missing _id' })
      }

      if(object['open'] == 'false'){
        object['open'] = false
      }
      
      const result = await mongo.putIssue(id, project, object)
      return res.json(result)
    })
    
    .delete(async function (req, res){
      let project = req.params.project
      
      const result = await mongo.deleteIssue(req.body['_id'], project)
      return res.json(result)
    });
    
}
