const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
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
        test('everything', (done) => {
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

                function matchesRegex(value, regex) {
                    return regex.test(value);
                }

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
    })
});
