// react main
/*global $*/
/*global io*/
'use strict';


import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory, IndexRoute, Redirect} from 'react-router'

import {createStore, combineReducers, applyMiddleware} from 'redux';
// const Provider = require('react-redux').Provider
import { Provider, connect } from 'react-redux'

const objectAssign = require('object-assign');

//require('es6-promise').polyfill();
//import fetch from 'isomorphic-fetch'


require("./styles.css");
/////////// SOCKET
/*
var socket = io();
socket.on( 'remove', function (item) {
    console.log("socket remove",item);
  stockStore.dispatch({type: 'REMOVE_STOCK_SYMBOL', book:item})
  //cb(event, item, array);
});

socket.on( 'save', function (item) {
    console.log("socket save",item);
  stockStore.dispatch({type: 'ADD_STOCK_SYMBOL', book:item})
  //cb(event, item, array);
});
*/
////////////// REDUX **********
/////REDUCER ///////
const handleBooks =(state=[],action)=>{
    switch(action.type){
        case 'SERVER_DATA':
            return action.book;
        case 'ADD_BOOK':
            return [...state, action.book];
        case 'REMOVE_BOOK':
            //console.log("reducer del",action);
            return state.filter(book => book._id!=action.book._id);
        case 'UPDATE_BOOK':
            console.log("TOGLE reducer action",action);
            return state.filter(book => book._id!=action.book._id).concat(action.book);
        default:
            return state;
    }
};

const handleUser =(state=null, action)=>{   //user {userid:'1', name:'sfsf'}
  switch(action.type) {
      case 'SET_USER':
        return action.user;
      default:
        return state;
  }
};
////FIN REDUCER ///

////////ACTION CREATOR//////
function setUser(uid){
    return {type:'SET_USER',user: {userId:uid}};
}


////////////
function getServerData() {

    return function(dispatch){
        /// http request
        var API_URL ="/api/books";

        $.get(API_URL)
            .done(function(data){
    //            console.log("server data",data);
                dispatch({type: 'SERVER_DATA', book:data})
            })
            .fail(function(err){
                console.error("error",err);
                //alert(err.responseText);
            });
    }
}

function addBook(bookName, user) {
/*
  return {
    type: 'ADD_STOCK_SYMBOL',
    book
  }
*/

    return function(dispatch){
        /// http request
        var API_URL ="/api/books";

 //$.ajaxSetup({ );


        $.ajax({
            url: API_URL,
            headers: { 'Authorization': user.tk },
            // beforeSend: function(xhr){xhr.setRequestHeader('X-Header', 'header-value');},   
            method: 'POST',
            //type:'post', //old versions use type instead method
            dataType: 'json',
            data: {
                "book":bookName, "userId": user.userId
            },
    //        contentType: "application/json; charset=utf-8",
            //processData:false,
            //cache: false,
        }).done(function(data){
                //console.log("data",data);
                // socket will add data to state
                dispatch({type: 'ADD_BOOK', book:data})
            })
            .fail(function(err){
                console.error("error",err);
                //alert(err.responseText);
            });
        
    }

}

function toggleBookRequest(book,user) {
    return function(dispatch){
        //change the book tradeRequest
        //remove user from list
        //send data to server n make toggle operation there, 
        //since once populated the array.. hard to modify, server will have the original array easier to modify
        /// http request
        var API_URL ="/api/books";

//        $.post(API_URL,{"book":book._id},null, "json")
        $.ajax({
            url:`${API_URL}/${book._id}`,
            method:"PUT",
            data: JSON.stringify({"action":"toggle","user":user.userId}),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            processData :false,
            headers: {
                "Authorization": user.tk  //for object property name, use quoted notation shown in second
            },
            //headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
        })
            .done(function(data){
                console.log("toggleBookRequest",data);
                // socket will add data to state
                dispatch({type:'UPDATE_BOOK', book: data}); //tradeRequest populated book returns
                
            })
            .fail(function(err){
                console.error("error",err);
                //alert(err.responseText);
            });
    }

}


function removeBook(book,user) {
/*    
  return {
    type: 'REMOVE_STOCK_SYMBOL',
    book
  }
*/

    return function(dispatch){
        /// http request
        var API_URL ="/api/books/";
//console.log("delete",book);
        $.ajax({
            url:API_URL+book._id,
            method:"DELETE",
            headers: {
                "Authorization": user.tk  //for object property name, use quoted notation shown in second
            },
        })
            .done(function(data){
                //console.log("data",data);
                // socket will remove data to state
                dispatch({type: 'REMOVE_BOOK', book:book})
            })
            .fail(function(err){
                console.error("error",err);
                //alert(err.responseText);
            });
    }
  
}

function setNewOwner(book,user,whoWantBookId) {
    return function(dispatch){
        //change the book tradeRequest
        //remove user from list
 //       console.log("setNewOwner", book, whoWantBookId);

        /// http request
        var API_URL ="/api/books";

//        $.post(API_URL,{"book":book._id},null, "json")
        $.ajax({
            url:`${API_URL}/${book._id}`,
            method:"PUT",
            data: JSON.stringify({"action":"newOwner","user":whoWantBookId}),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            processData :false,
            headers: {
                "Authorization": user.tk  //for object property name, use quoted notation shown in second
            },
            //headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
        })
            .done(function(data){
 //               console.log("data from put",data, newBook);
                // socket will add data to state
                //console.log("toogleBookRequest", book, userId);
                dispatch({type:'UPDATE_BOOK', book: data});
                
            })
            .fail(function(err){
                console.error("error",err);
                //alert(err.responseText);
            });
    }

}


function declineRequest(book,user,whoWantBookId) {
    return function(dispatch){
        //change the book tradeRequest
        //remove user from list
        /// http request
        var API_URL ="/api/books";

//        $.post(API_URL,{"book":book._id},null, "json")
        $.ajax({
            url:`${API_URL}/${book._id}`,
            headers: {
                "Authorization": user.tk  //for object property name, use quoted notation shown in second
            },
            method:"PUT",
            data: JSON.stringify({"action":"decline","user":whoWantBookId}),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
//            processData :false,
        })
            .done(function(data){
   //             console.log("data from put",data, newBook);
                // socket will add data to state
                //console.log("toogleBookRequest", book, userId);
                dispatch({type:'UPDATE_BOOK', book: data});  //return populated tradeRequest book
                
            })
            .fail(function(err){
                console.error("error",err);
                //alert(err.responseText);
            });
    }

}

///////END ACTION CREATOR//////////

/////////////////

//const AddSymbolForm = connect()(SymbolForm);
class AddBookForm extends React.Component {
    constructor(props){
        super(props);
        
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e){
        const {store} = this.context;
        e.preventDefault();
        var book = this.refs.book.value;
       
        store.dispatch(addBook(book, store.getState().user));
        this.refs.book.value='';
    }
        
    render(){
        return (
            <div className="col-md-12">
                <div className="panel panel-success">
                  <div className="panel-heading">
                    <h3 className="panel-title">Add new Book:</h3>
                        
                  </div>
                  <div className="panel-body">
                        <form onSubmit={this.handleSubmit}>
                            <div className="input-group  input-group-lg">
                              <input type="text" ref="book" placeholder="Enter book name here" className="form-control" />
                              <span className="input-group-btn">
                                <button type="submit" className="btn btn-lg btn-success">
                                    <span className="glyphicon glyphicon-ok-sign" aria-hidden="true"></span> Add
                                </button> 
                              </span>
                            </div>
                            
                        </form>
                  </div>
                </div>
            </div>
            );
    }
}
AddBookForm.contextTypes = {
  store: React.PropTypes.object
}



class Book extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        const {book, userId, onClose, onTrade} = this.props;
        const defaultImg = "http://artsandcrafts.gr/css/img/na.jpg";
        var requested = book.tradeRequest.filter(function(u){
            if(u.user) return u.user._id==userId;
            return false;
        }).length > 0;
        console.log("traderequest",book.tradeRequest,userId,requested);
        return (
            <div className="book">
            
                <img src={book.image|| defaultImg} className="bookImg"/>
                <div className="bookName">{book.name}</div>
                { userId && (book.owner === userId) &&
                <button onClick={onClose} className="closeBtn btn btn-danger btn-xs">
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button> 
                }
                
                { userId && (book.owner !== userId) &&
                <button onClick={onTrade} className="tradeBtn">
                    <span className="glyphicons glyphicons-iphone-transfer" aria-hidden="true">{requested?"cancel request":"Request"}</span>
                </button> 
                }
                { userId && (book.owner === userId) &&
                <div className="reqPendant">
                    <span className="glyphicons glyphicons-alarm" aria-hidden="true"></span>{book.tradeRequest.length} request
                </div> 
                }
            </div>

            );
    }
}

class _BookList extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        const {books,user, remBook,toggleBook} = this.props;
        //console.log("books",this.props);
        const userId =user&&user.userId ? user.userId : null;
        //console.log(books);
        return(
                <div class="bookList">
                    {books.map((book,i)=>(
                        <Book key={i} book={book} userId={userId} onClose={()=>remBook(book,user)} onTrade={()=>toggleBook(book, user)}/>
                    ))}
                </div>
        );
    }
}
function mapDispatchToProps(dispatch){
    return {
        remBook: (book,user)=>{
            dispatch(removeBook(book,user));
        },
        toggleBook : (book, user)=>{
            dispatch(toggleBookRequest(book,user));
        }
    };
}
function mapStateToProps(state) {
 //   console.log("mapstatetoprops store",state);
    return {
        books:state.books,
        user:state.user
    }
}
var BookList = connect(mapStateToProps,mapDispatchToProps)(_BookList);

////////
function mapStateToMyBooksProps(state) {
    //console.log("mapstatetoprops store",state);
    return {
        books:state.books.filter(book=>book.owner==state.user.userId),
        user:state.user
    }
}
var MyBookList = connect(mapStateToMyBooksProps,mapDispatchToProps)(_BookList);
////////
const Request =({whoWantBook, onAccept, onDecline})=>(
    <li className="request list-group-item">
        <span className="">{whoWantBook}</span>
        <span className="btn-group" role="group" aria-label="...">
            <button className="btn btn-xs btn-info" onClick={onAccept}><span className="glyphicon glyphicon-ok" aria-hidden="true"></span></button>
            <button className="btn btn-xs btn-danger" onClick={onDecline}><span className="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
        </span>
    </li>
    );
//////////////
let Pendants = ({books,user, Accept, Decline})=>{
    const defaultImg = "http://artsandcrafts.gr/css/img/na.jpg";
    return (
        <div className="requestList">
            {
                books.map((book,k)=>{
                    if(book.tradeRequest.length>0){
                    return (
                        <div className="row pendants" key={k}>
                            <div className="col-xs-4">
                                <img src={book.image||defaultImg} className="bookImg img-responsive"/>
                                <p className="bookName">{book.name}</p>
                            </div>
                            <div className="col-xs-8">
                                <button className="btn btn-xs btn-danger" onClick={()=>Decline(book,user,"*")}><span className="glyphicon glyphicon-remove" aria-hidden="true"></span> Decline All</button>
                                <ul className="list-group">
                                {book.tradeRequest.map((whoWantBook,i)=><Request key={i} whoWantBook={whoWantBook.user?whoWantBook.user.email:"unknown"}
                                                                    onAccept={()=>Accept(book,user,whoWantBook.user._id)}
                                                                    onDecline={()=>Decline(book,user,whoWantBook.user._id)}
                                                                 />)}
                                </ul>
                            </div>
                        </div>
                        );
                    }
                    return null;
                })

            }
        </div>
        );
    };

function mapDispatchPendantsToProps(dispatch){
    return {
        Accept:(book,user,whoWantBookId)=>{
            // set owner to new user and clear tradeRequest array
            //dispatch some action
            console.log("accept ", book, whoWantBookId);
            dispatch(setNewOwner(book, user, whoWantBookId));
        },
        Decline:(book,user,whoWantBookId)=>{
            // remove user from tradeRequest Array
            //dispatch some action
            console.log("decline ", book,whoWantBookId);
            dispatch(declineRequest(book,user, whoWantBookId));
        },
    }
}
Pendants = connect(mapStateToMyBooksProps, mapDispatchPendantsToProps)(Pendants)
///////////////
const MyBooksWithRequest =()=>(
    <div className="row">
        <div className="col-sm-8">
            <div className="row">
                <AddBookForm />
                <MyBookList />
            </div>
        </div>
        <div className="col-sm-4 pendantList">
            <h3 className="text-center">List of pendant requests</h3>
            <Pendants />
        </div>
    </div>
)

///////////
class Main extends React.Component {
    constructor(props){
        super(props);
    }
    
    componentDidMount(){
        //get initial data from server
        this.context.store.dispatch(getServerData());
        //this.context.store.dispatch(setUser(window.uid));
    }
    
    render(){
        
        ////////.
        //const state = this.context.store.getState();
        console.log("Main state",this.context.store.getState());
        return (
            
            <div >
                <p></p>
                {this.props.children }
            </div>
            );
    }
}
Main.contextTypes={
    store: React.PropTypes.object
};

/*
export default class Root extends Component {
  render() {
    return (
      <Provider store={bookStore}>
        <Main />
      </Provider>
    )
  }
}
*/
//ReactDOM.render(<Root/>, document.getElementById("app"));


///// STORE ///
import thunk from 'redux-thunk';
console.log("window.uid", window.__uid);
const initialState = {books:[],user:{userId:window.__uid, tk: window.__tk}};
const createStoreWithThunk = applyMiddleware(thunk)(createStore);
const allReducers = combineReducers({books:handleBooks,user:handleUser});
const bookStore = createStoreWithThunk(allReducers, initialState);
console.log("storeeeee",bookStore.getState());
/*
const stockStore = createStore(
  handleStocks,
  initialState,
  applyMiddleware(
    thunk // lets us dispatch() functions
  )
)
*/
/// FIN STORE ////

function requireAuth(nextState, replace) {
    //console.log(nextState.location);
  if (!bookStore.getState().user.userId) {
      /*
    replace({
      pathname: '/auth/twitter' // only work if auth/twiter if part of <Route> list
    })
    */
    window.location = "/";
    
    
    //router.replace({ pathname, query, state }) // new "location descriptor"
     
  }
}

ReactDOM.render((
<Provider store={bookStore}>
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
        <IndexRoute component={BookList} />

        <Route path="Books" component={BookList}></Route>
        <Route path="MyBooks" component={MyBooksWithRequest}   onEnter={requireAuth}></Route>

    
    </Route>
  </Router>
</Provider>  
), document.getElementById("app"));