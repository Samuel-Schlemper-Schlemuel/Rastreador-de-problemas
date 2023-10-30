const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    function matchesRegex(value, regex) {
        return regex.test(value);
    }

    test('Status', (done) => {
        chai
        .request(server)
        .get('/api/issues/apitest')
        .end((err, res) => {
            assert.equal(res.status, 200)
            done()
        })
    })

    suite('Post', () => {
        test('Everything', (done) => {
            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "Text",
                "created_by": "Schlemuel",
                "assigned_to": "Samuel Schlemper",
                "status_text": "Functional"}
                )
            .end((err, res) => {
                const expected = {"issue_title": "Title",
                issue_text: "Text",
                created_by: "Schlemuel",
                assigned_to: "Samuel Schlemper",
                status_text: "Functional",
                open: true,
                created_on: /^\d{4}-\d{2}-\d{2}/,
                updated_on: /^\d{4}-\d{2}-\d{2}/,
                _id: /.{24}/}

                const actual = res.body

                assert.equal(actual.issue_title, expected.issue_title)
                assert.equal(actual.issue_text, expected.issue_text)
                assert.equal(actual.created_by, expected.created_by)
                assert.equal(actual.assigned_to, expected.assigned_to)
                assert.equal(actual.status_text, expected.status_text)
                assert.equal(actual.open, expected.open)
                assert.isTrue(matchesRegex(actual.created_on, expected.created_on))
                assert.isTrue(matchesRegex(actual.updated_on, expected.updated_on))
                assert.isTrue(matchesRegex(actual._id, expected._id))

                done()
            })
        })

        test('Not everything', (done) => {
            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "Text",
                "created_by": "Schlemuel"}
                )
            .end((err, res) => {
                const expected = {"issue_title": "Title",
                issue_text: "Text",
                created_by: "Schlemuel",
                assigned_to: "",
                status_text: "",
                open: true,
                created_on: /^\d{4}-\d{2}-\d{2}/,
                updated_on: /^\d{4}-\d{2}-\d{2}/,
                _id: /.{24}/}

                const actual = res.body

                assert.equal(actual.issue_title, expected.issue_title)
                assert.equal(actual.issue_text, expected.issue_text)
                assert.equal(actual.created_by, expected.created_by)
                assert.equal(actual.assigned_to, expected.assigned_to)
                assert.equal(actual.status_text, expected.status_text)
                assert.equal(actual.open, expected.open)
                assert.isTrue(matchesRegex(actual.created_on, expected.created_on))
                assert.isTrue(matchesRegex(actual.updated_on, expected.updated_on))
                assert.isTrue(matchesRegex(actual._id, expected._id))

                done()
            })
        })

        test('Nothing', (done) => {
            chai
            .request(server)
            .post('/api/issues/apitest')
            .send({ })
            .end((err, res) => {
                const expected = {error: 'required field(s) missing'}

                const actual = res.body

                assert.deepEqual(actual, expected)

                done()
            })
        })
    })

    suite('Get', () => {
        test('Geting', (done) => {
            chai
            .request(server)
            .get('/api/issues/apitest')
            .end((err, res) => {
                const actual = res.body

                assert.isTrue(Array.isArray(actual))

                done()
            })
        })

        test('Geting with filter', (done) => {
            chai
            .request(server)
            .get('/api/issues/apitest?open=false')
            .end((err, res) => {
                const actual = res.body
                let correct = true

                if(actual.length > 0){
                    for(let i in actual){
                        if(actual[i].open != false){
                            correct = false
                        }
                    }
                }

                assert.isTrue(correct)

                done()
            })
        })

        test('Geting with filters', (done) => {
            chai
            .request(server)
            .get('/api/issues/apitest?open=true&issue_text=Text')
            .end((err, res) => {
                const actual = res.body
                let correct = true

                if(actual.length > 0){
                    for(let i in actual){
                        if(actual[i].open != true){
                            correct = false
                        }
                        if(actual[i].issue_text != 'Text'){
                            correct = false
                        }
                    }
                }

                assert.isTrue(correct)

                done()
            })
        })
    })

    suite('Put', () => {
        test('Updating', (done) => {
            let id

            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "For change",
                "created_by": "Schlemuel"}
            )
            .end((err, res) => {
                id = res.body._id
            })

            setTimeout(() => {
                    chai
                    .request(server)
                    .put('/api/issues/apitest')
                    .send({
                        issue_text: "Changed",
                        _id: id
                    })
                    .end((err, res) => {
                        const actual = res.body
        
                        assert.deepEqual(actual,  {'result': 'successfully updated', '_id': id})
        
                        done()
                    }) 
            }, 200)
        })

        test('Updating many', (done) => {
            let id

            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "For change",
                "created_by": "Schlemuel"}
            )
            .end((err, res) => {
                id = res.body._id
            })

            setTimeout(() => {
                    chai
                    .request(server)
                    .put('/api/issues/apitest')
                    .send({
                        issue_title: "New title",
                        issue_text: "Changed",
                        _id: id
                    })
                    .end((err, res) => {
                        const actual = res.body
        
                        assert.deepEqual(actual,  {'result': 'successfully updated', '_id': id})
        
                        done()
                    }) 
            }, 200)
        })

        test('Updating without id', (done) => {
            let id

            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "For change",
                "created_by": "Schlemuel"}
            )
            .end((err, res) => {
                id = res.body._id
            })

            setTimeout(() => {
                    chai
                    .request(server)
                    .put('/api/issues/apitest')
                    .send({
                        issue_title: "Changed",
                        _id: ''
                    })
                    .end((err, res) => {
                        const actual = res.body
        
                        assert.deepEqual(actual,  { error: 'missing _id' })
        
                        done()
                    }) 
            }, 200)
        })

        test('Updating without documents', (done) => {
            let id

            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "For change",
                "created_by": "Schlemuel"}
            )
            .end((err, res) => {
                id = res.body._id
            })

            setTimeout(() => {
                    chai
                    .request(server)
                    .put('/api/issues/apitest')
                    .send({
                        _id: id
                    })
                    .end((err, res) => {
                        const actual = res.body

                        assert.deepEqual(actual, {error: 'no update field(s) sent', '_id': id})
        
                        done()
                    }) 
            }, 200)
        })

        test('Updating id invalid', (done) => {
            let id

            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "For change",
                "created_by": "Schlemuel"}
            )
            .end((err, res) => {
                id = res.body._id
            })

            setTimeout(() => {
                    chai
                    .request(server)
                    .put('/api/issues/apitest')
                    .send({
                        issue_text: "Changed",
                        _id: 'abc'
                    })
                    .end((err, res) => {
                        const actual = res.body

                        assert.deepEqual(actual, {error: 'could not update', '_id': 'abc'})
        
                        done()
                    }) 
            }, 200)
        })
    })

    suite('Delete', () => {
        test('Deleting', (done) => {
            let id

            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "For delet",
                "created_by": "Schlemuel"}
            )
            .end((err, res) => {
                id = res.body._id
            })

            setTimeout(() => {
                    chai
                    .request(server)
                    .delete('/api/issues/apitest')
                    .send({
                        _id: id
                    })
                    .end((err, res) => {
                        const actual = res.body

                        assert.deepEqual(actual, {result: 'successfully deleted', '_id': id})
        
                        done()
                    }) 
            }, 200)
        })

        test('Invalid id', (done) => {
            let id

            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "For delet",
                "created_by": "Schlemuel"}
            )
            .end((err, res) => {
                id = res.body._id
            })

            setTimeout(() => {
                    chai
                    .request(server)
                    .delete('/api/issues/apitest')
                    .send({
                        _id: 'abc'
                    })
                    .end((err, res) => {    
                        const actual = res.body

                        assert.deepEqual(actual, {error: 'could not delete', '_id': 'abc'})
        
                        done()
                    }) 
            }, 200)
        })

        test('Without id', (done) => {
            let id

            chai
            .request(server)
            .post('/api/issues/apitest')
            .send(
                {"issue_title": "Title",
                "issue_text": "For delet",
                "created_by": "Schlemuel"}
            )
            .end((err, res) => {
                id = res.body._id
            })

            setTimeout(() => {
                    chai
                    .request(server)
                    .delete('/api/issues/apitest')
                    .send({
                        _id: undefined
                    })
                    .end((err, res) => {
                        const actual = res.body

                        assert.deepEqual(actual, { error: 'missing _id' })
        
                        done()
                    }) 
            }, 200)
        })
    })
})