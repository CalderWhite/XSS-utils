from flask import Flask
from flask import request
from io import StringIO

import yaml
import requests
import json
import re

app = Flask(__name__)


@app.route("/api/test",methods=['POST'])
def handleTest():
    # no error handling for now.
    # INJECTION
    raw_inject_data = StringIO(request.form["text"])
    inject_data = yaml.load(raw_inject_data)
    inject_data = inject_data["request"]
    res = requests.get(
        inject_data["url"],
        data=inject_data["payload"],
        headers=inject_data["headers"]
    )
    injection_status = res.status_code
    # TESTING INJETION
    raw_test_data = StringIO(request.form["script"])
    test_config = yaml.load(raw_test_data)
    # making this easier to read
    request_config = test_config["request"]
    # make the request to the given url
    res = requests.get(
        request_config["url"],
        headers=request_config["headers"]
    )
    # check if there is a match for our success regexp
    text = res.text
    pattern = re.compile(re.escape(test_config["regexp"]))
    found = re.search(pattern, text) != None
    code = res.status_code
    # if the text response is in json, format it.
    if res.headers["Content-Type"].find("application/json") > -1:
        j = json.loads(text)
        text = json.dumps(j,indent=4)
    # return our findings
    response = {
        "success" : found,
        "server_response_code" : code,
        "server_response_text" : text,
        "server_response_type" : res.headers["Content-Type"],
        "inject_response_code" : injection_status
    }
    return json.dumps(response)

@app.route("/")
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)