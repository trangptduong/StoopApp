from flask import Flask, request, jsonify, app, session
from flask_cors import CORS
from flask_session import Session
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import pyrebase
import os
import redis

load_dotenv()

app = Flask(__name__, static_folder='build/', static_url_path='/')
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = redis.from_url(os.environ['REDISTOGO_URL'])
socketio = SocketIO(app)
Session(app)
CORS(app)

firebaseConfig =  {
    "apiKey": os.environ['FB_APIKEY'],
    "authDomain": os.environ['FB_AUTHDOMAIN'],
    "storageBucket": os.environ['FB_STORAGEBUCKET'],
    "projectId": os.environ['FB_PROJID'],
    "messagingSenderId": os.environ['FB_MSGSENDRID'],
    "appId": os.environ['FB_APPID'],
    "measurementId": os.environ['FB_MEASUREID'],
    "databaseURL": os.environ['FB_DBURL']
}

firebase = pyrebase.initialize_app(firebaseConfig)
auth = firebase.auth()
db = firebase.database()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    try:
        response = auth.sign_in_with_email_and_password(email, password)
        response = auth.refresh(response['refreshToken'])
        session['token'] = response['idToken']
        session['uid'] = response['userId']
        session['email'] = email
        session['lalert'] = db.child('users').child(session.get('uid')).child('settings').child('Listing Alerts').get(session.get('token')).val()
        return jsonify(response), 201
    except Exception as e:
        message = "Please check your credentials."
        print(message)
        return jsonify(message), 401

@app.route("/api/logout", methods=["POST"])
def logout():
    try:
        for key in list(session.keys()):
            session.pop(key)
        return jsonify("Logged out"), 201
    except Exception as e:
        message = "User not logged in"
        print(message)
        return jsonify(message), 401


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    response = auth.create_user_with_email_and_password(email, password)
    return jsonify(response), 201


@app.route('/api/settings', methods=['GET', 'POST'])
def get_settings():
    setting_names = ['Listing Alerts']

    #User id should be in session var
    #Check if db path exists
    if not db.child('users').child(session.get('uid')).child('settings').shallow().get(session.get('token')).val():
        db.child('users').child(session.get('uid')).child('settings').set({'Listing Alerts': 'Off'}, session.get('token'))

    #Get settings from database and send to frontend
    if request.method == 'GET':
        user_prefs = db.child('users').child(session.get('uid')).child('settings').get(session.get('token')).val()
        setting_vals = {}
        #Get settings from database and ignore any misc settings
        for key in user_prefs:
            value = user_prefs[key]
            if key in setting_names:
                setting_vals[key] = value
                setting_names.remove(key)
        #Check if any settings not in the database and add them
        for item in setting_names:
            setting_vals[item] = 'Off'
            db.child('users').child(session.get('uid')).child('settings').set({item: 'Off'}, session.get('token'))
        return jsonify(values=setting_vals, email=session.get('email'))

    #Update settings in database
    elif request.method == 'POST':
        data = request.get_json()
        name = data["settingName"]
        value = data["settingValue"]
        session['lalert'] = value
        db.child('users').child(session.get('uid')).child('settings').update({name: value}, session.get('token'))
        return jsonify(message="Got it!")

@app.route('/api/trackListing', methods=['POST'])
def track_listing():
    listingID = request.get_json()['listingID']
    if not db.child('listings').child(listingID).get(session.get('token')).val():
        return jsonify("Listing couldn't be found"), 404
    elif db.child('users').child(session.get('uid')).child('subscriptions').child(listingID).get(session.get('token')).val():
        return jsonify("Already tracking listing"), 404
    else:
        db.child('users').child(session.get('uid')).child('subscriptions').child(listingID).set('On', session.get('token'))
        return jsonify("Tracking listing"), 201

@app.route('/api/markTaken', methods=['POST'])
def mark_taken():
    listingID = request.get_json()['listingID']
    if not db.child('listings').child(listingID).get(session.get('token')).val():
        return jsonify("Listing couldn't be found"), 404
    else:
        db.child('listings').child(listingID).update({'taken': "Yes"}, session.get('token'));
        return jsonify("Listing updated"), 201

@socketio.on('set_taken')
def taken_listener(json_data):
    emit('broadcast_taken', {'message': 'The following listing has been taken: '+json_data['listingID'], 'listingID': json_data['listingID']}, broadcast=True)

@socketio.on('client_taken')
def check_LAlert(json_data):
    if session['lalert'] == "On" and db.child('users').child(session.get('uid')).child('subscriptions').shallow().get(session.get('token')).val():
        sub_list = db.child('users').child(session.get('uid')).child('subscriptions').get(session.get('token')).val()
        for sub in sub_list:
            #If there's an update in one of the user's subscriptions
            if sub == json_data['listingID']:
                #Check if sub was on and listing was taken
                if sub_list[sub] == "On":
                    db.child('users').child(session.get('uid')).child('subscriptions').update({sub: "Off"},session.get('token'))
                    emit('notify_client', {'message': json_data['message']})

@app.route('/api/reportListing', methods=['POST'])
def report_listing():
    listingID = request.get_json()['listingID']
    if not db.child('listings').child(listingID).get(session.get('token')).val():
        return jsonify("Listing couldn't be found"), 404
    else:
        if 'reports' not in db.child('listings').child(listingID).get(session.get('token')).val():
            db.child('listings').child(listingID).child('reports').set(1, session.get('token'))
        else:
            reportCount = int(db.child('listings').child(listingID).child('reports').get(session.get('token')).val()) + 1
            db.child('listings').child(listingID).child('reports').set(reportCount, session.get('token'))
        return jsonify(message="Listing has been reported"), 201

@app.route('/api/listing', methods=['POST'])
def listing_info():
    listingID = request.get_json()['listingID']
    if request.method == 'POST':
        if not db.child('listings').child(listingID).get(session.get('token')).val():
            return jsonify("Listing couldn't be found"), 404
        else:
            listing = db.child('listings').child(listingID).get(session.get('token')).val()
            ptitle = listing['title']
            pdesc = listing['desc']
            if 'photos' in listing:
                pphotos = listing['photos']
            else:
                pphotos = {1: None}
            if 'comments' in listing:
                pcommentList = listing['comments']
            else:
                pcommentList = {}
            ptaken = listing['taken']
            return jsonify(title=ptitle, desc=pdesc, photos=pphotos, commentList=pcommentList, taken=ptaken), 201

@app.route('/api/addComment', methods=['POST'])
def add_comment():
    data = request.get_json()
    listingID = data['listingID']
    comment = data['comment']
    if not db.child('listings').child(listingID).get(session.get('token')).val():
        return jsonify("Listing couldn't be found"), 404
    else:
        commentCount = db.child('listings').child(listingID).child('comments').get(session.get('token')).val()
        if commentCount:
            commentCount = len(commentCount)
        else:
            commentCount = 0
        db.child('listings').child(listingID).child('comments').child(commentCount).set({'author': session.get('email'), 'content': comment},session.get('token'))
        pcommentList = db.child('listings').child(listingID).child('comments').get(session.get('token')).val()
        return jsonify(message = "Comment added", commentList = pcommentList), 201

@app.route('/api/addListing', methods=['POST'])
def add_listing():
    data = request.get_json()
    listingID = str(len(db.child('listings').get(session.get('token')).val()))
    plat = data['lat']
    plong = data['lng']
    ptitle = data['title']
    pdesc = data['desc']
    ptype = data['type']
    db.child('listings').child(listingID).set({'title': ptitle, 'desc': pdesc, 'taken': 'No', 'lat': plat, 'lng': plong, 'type': ptype}, session.get('token'))
    return get_all_listings()

@app.route('/api/getAllListings', methods=['GET'])
def get_all_listings():
    allListings = db.child('listings').get(session.get('token')).val()
    notTaken = []
    for listingID in allListings:
        id = listingID
        attr = allListings[id]
        if not attr['taken'] == "Yes":
            attr['id'] = str(id)
            notTaken.append(attr)
    return jsonify(dbMarkers = notTaken), 200

@app.route('/<path:path>')
def static_file(path):
    return app.send_static_file(path)

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=False, port=int(os.environ.get("PORT", 5000)))