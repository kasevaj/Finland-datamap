import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from routes import api

app = Flask(__name__)
app.json.ensure_ascii = False  # send ä/ö as-is instead of ä escapes
CORS(app)
app.register_blueprint(api)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
