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
            return state.filter(book => book.isbn!=action.book.isbn);
        case 'UPDATE_BOOK':
            console.log("TOGLE reducer action",action);
            return state.filter(book => book.isbn!=action.book.isbn).concat(action.book);
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

///// STORE ///
import thunk from 'redux-thunk';
const initialState = {books:[],user:{}};
const createStoreWithThunk = applyMiddleware(thunk)(createStore);
const allReducers = combineReducers({books:handleBooks,user:handleUser});
const bookStore = createStoreWithThunk(allReducers, initialState);
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
////////ACTION CREATOR//////
function setUser(){
    return {type:'SET_USER',user: {userId:'1', name:'test'}};
}


////////////
function getServerData() {

    return function(dispatch){
        /// http request
        var API_URL ="/api/books";

        $.get(API_URL)
            .done(function(data){
                console.log("server data",data);
                dispatch({type: 'SERVER_DATA', book:data})
            })
            .fail(function(err){
                console.error("error",err);
                //alert(err.responseText);
            });
    }
}

function addBook(bookName) {
/*
  return {
    type: 'ADD_STOCK_SYMBOL',
    book
  }
*/

    return function(dispatch){
        /// http request
        var API_URL ="/api/books";

        $.post(API_URL,{"book":bookName},null, "json")
            .done(function(data){
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

function toggleBookRequest(book,userId) {
    return function(dispatch){
        //change the book tradeRequest
        //remove user from list
        console.log("toggle", book, userId);
        let imOnList = book.tradeRequest.indexOf(userId)>-1;
        var newBook;
        if(imOnList){
            //remove
            newBook= Object.assign({}, book, {
                tradeRequest : book.tradeRequest.filter(function(user){user != userId})
            });
        } else {
            //add user to list
            newBook= Object.assign({}, book, {
                tradeRequest: [...book.tradeRequest, userId]
            });
        }
console.log("after changes", newBook);
        /// http request
        var API_URL ="/api/books";

//        $.post(API_URL,{"book":book._id},null, "json")
        $.ajax({
            url:`${API_URL}/${book._id}`,
            type:"PUT",
            data: JSON.stringify(newBook),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            processData :false,
            //headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
        })
            .done(function(data){
                console.log("data from put",data, newBook);
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


function removeBook(book) {
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
            type:"DELETE"
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

function setNewOwner(book,userId) {
    return function(dispatch){
        //change the book tradeRequest
        //remove user from list
        console.log("setNewOwner", book, userId);
        var newBook= Object.assign({}, book, {
            owner: userId,
            tradeRequest: []
        });

        /// http request
        var API_URL ="/api/books";

//        $.post(API_URL,{"book":book._id},null, "json")
        $.ajax({
            url:`${API_URL}/${book._id}`,
            type:"PUT",
            data: JSON.stringify(newBook),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            processData :false,
            //headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
        })
            .done(function(data){
                console.log("data from put",data, newBook);
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


function declineRequest(book,userId) {
    return function(dispatch){
        //change the book tradeRequest
        //remove user from list
        console.log("declineRequest", book, userId);
        var newBook= Object.assign({}, book, {
                tradeRequest : book.tradeRequest.filter(user=>user != userId)
            });

        /// http request
        var API_URL ="/api/books";

//        $.post(API_URL,{"book":book._id},null, "json")
        $.ajax({
            url:`${API_URL}/${book._id}`,
            type:"PUT",
            data: JSON.stringify(newBook),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            processData :false,
            //headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
        })
            .done(function(data){
                console.log("data from put",data, newBook);
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

function declineAllRequest(book) {
    return function(dispatch){
        //change the book tradeRequest
        //remove user from list
        console.log("declineAllRequest", book);
        var newBook= Object.assign({}, book, {
                tradeRequest : []
            });

        /// http request
        var API_URL ="/api/books";

//        $.post(API_URL,{"book":book._id},null, "json")
        $.ajax({
            url:`${API_URL}/${book._id}`,
            type:"PUT",
            data: JSON.stringify(newBook),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            processData :false,
            //headers: {"X-HTTP-Method-Override": "PUT"}, // X-HTTP-Method-Override set to PUT.
        })
            .done(function(data){
                console.log("data from put",data, newBook);
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
        store.dispatch(addBook(book));
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
        var requested = book.tradeRequest.indexOf(userId) > -1;
        return (
            <div className="book">
                <img src={book.image|| defaultImg} className="bookImg"/>
                <div className="bookName">{book.name}</div>
                { book.owner === userId &&
                <button onClick={onClose} className="closeBtn btn btn-danger btn-xs">
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button> 
                }
                
                { book.owner !== userId &&
                <button onClick={onTrade} className="tradeBtn">
                    <span className="glyphicons glyphicons-iphone-transfer" aria-hidden="true">{requested?"cancel request":"Request"}</span>
                </button> 
                }
                { book.owner === userId &&
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
        console.log("books",this.props);
        const userId =user&&user.userId ? user.userId : null;
        return(
                <div class="bookList">
                    {books.map((book,i)=>(
                        <Book key={i} book={book} userId={userId} onClose={()=>remBook(book)} onTrade={()=>toggleBook(book, userId)}/>
                    ))}
                </div>
        );
    }
}
function mapDispatchToProps(dispatch){
    return {
        remBook: (book)=>{
            dispatch(removeBook(book));
        },
        toggleBook : (book, userId)=>{
            dispatch(toggleBookRequest(book,userId));
        }
    };
}
function mapStateToProps(state) {
    //console.log("mapstatetoprops store",state);
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
const Request =({user, onAccept, onDecline})=>(
    <li className="request list-group-item">
        <span>{user}</span>
        <div className="btn-group pull-right" role="group">
            <button className="btn btn-xs btn-info" onClick={onAccept}><span className="glyphicon glyphicon-ok" aria-hidden="true"></span></button>
            &nbsp;
            <button className="btn btn-xs btn-danger" onClick={onDecline}><span className="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
        </div>
    </li>
    );
//////////////
let Pendants = ({books, Accept, Decline, DeclineAll})=>{
    const defaultImg = "http://artsandcrafts.gr/css/img/na.jpg";
    return (
        <div className="row">
            {
                books.map((book,k)=>{
                    if(book.tradeRequest.length>0){
                    return (
                        <div className="requestList" key={k}>
                            <div className="col-xs-4">
                                <img src={book.image||defaultImg} className="bookImg img-responsive"/>
                                <p className="bookName">{book.name}</p>
                            </div>
                            <div className="col-xs-8">
                                <button className="btn btn-xs btn-danger" onClick={()=>DeclineAll(book)}><span className="glyphicon glyphicon-remove" aria-hidden="true"></span> Decline All</button>
                                <ul className="list-group">
                                {book.tradeRequest.map((userId,i)=><Request key={i} user={userId}
                                                                    onAccept={()=>Accept(book,userId)}
                                                                    onDecline={()=>Decline(book,userId)}
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
        Accept:(book,newOwner)=>{
            // set owner to new user and clear tradeRequest array
            //dispatch some action
            console.log("accept ", book, newOwner);
            dispatch(setNewOwner(book, newOwner));
        },
        Decline:(book,newOwner)=>{
            // remove user from tradeRequest Array
            //dispatch some action
            console.log("decline ", book,newOwner);
            dispatch(declineRequest(book, newOwner));
        },
        DeclineAll:(book)=>{
            // remove user from tradeRequest Array
            //dispatch some action
            console.log("declineAll ", book);
            dispatch(declineAllRequest(book));
        }

    }
}
Pendants = connect(mapStateToMyBooksProps, mapDispatchPendantsToProps)(Pendants)
///////////////
const MyBooksWithRequest =()=>(
    <div className="row">
        <div className="col-sm-9">
            <div className="row">
                <AddBookForm />
                <MyBookList />
            </div>
        </div>
        <div className="col-sm-3 pendantList">
            <h3>List of pendant requests</h3>
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
        
        this.context.store.dispatch(setUser());
        console.log("state",this.context.store.getState());
    }
    
    render(){
        
        ////////.
        //const state = this.context.store.getState();
        
        return (
            
            <div >
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


ReactDOM.render((
<Provider store={bookStore}>
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
        <IndexRoute component={BookList} />

        <Route path="Books" component={BookList}></Route>
        <Route path="MyBooks" component={MyBooksWithRequest}></Route>

    
        <Redirect from="*" to="/" />
    </Route>
  </Router>
</Provider>  
), document.getElementById("app"));