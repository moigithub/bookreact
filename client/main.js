// react main
/*global $*/
/*global io*/
'use strict';


import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
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
const initialState = [];
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
                console.log("error",err);
                alert(err.responseText);
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
                console.log("error",err);
                alert(err.responseText);
            });
    }

}

function toggleBookRequest(book,userId) {
    return function(dispatch){
        /// http request
        var API_URL ="/api/books";

//        $.post(API_URL,{"book":book._id},null, "json")
        $.ajax({
            url:`API_URL/${book._id}/${userId}`,
            type:"PUT"
        })
            .done(function(data){
                //console.log("data",data);
                // socket will add data to state
                dispatch({type: 'ADD_BOOK', book:data})
            })
            .fail(function(err){
                console.log("error",err);
                alert(err.responseText);
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
                console.log("error",err);
                alert(err.responseText);
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
            <div className="col-xs-12 col-sm-6 col-md-4">
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
                                    <span className="glyphicon glyphicon glyphicon-ok-sign" aria-hidden="true"></span> Add
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
        const {book, onClose, onTrade} = this.props;
        const defaultImg = "http://artsandcrafts.gr/css/img/na.jpg";
        return (
            <div className="book">
                <img src={book.image|| defaultImg} className="bookImg"/>
                <div className="bookName">{book.name}</div>
                <button onClick={onClose} className="closeBtn btn btn-danger btn-xs">
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button> 
                
                <button onClick={onTrade} className="tradeBtn">
                    <span class="glyphicons glyphicons-iphone-transfer" aria-hidden="true">Trade</span>
                </button> 
            </div>

            );
    }
}

class _BookList extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        const {books, remBook} = this.props;
        console.log("books",this.props);
        return(
            <div class="bookList">
                {books.map((book,i)=>(
                    <Book key={i} book={book} onClose={()=>remBook(book)} onTrade={()=>alert('trade!')}/>
                ))}
            </div>
        );
    }
}
function mapDispatchToProps(dispatch){
    return {
        remBook: (book)=>{
            dispatch(removeBook(book));
        }
    };
}
function mapStateToProps(state) {
    //console.log("mapstatetoprops store",state);
    return {
        books:state.books
    }
}
var BookList = connect(mapStateToProps,mapDispatchToProps)(_BookList);


class Main extends React.Component {
    constructor(props){
        super(props);

    }
    
    componentDidMount(){
        //get initial data from server
        this.context.store.dispatch(getServerData());
        
        this.context.store.dispatch(setUser());
    }
    
    render(){
        
        ////////.
        //const state = this.context.store.getState();
        
        return (
            
            <div>
                <div id="bookList">
                    <div className="row">
                        <AddBookForm />
                        <BookList />

                    </div>
                </div>
            </div>
            );
    }
}
Main.contextTypes={
    store: React.PropTypes.object
};

export default class Root extends Component {
  render() {
    return (
      <Provider store={bookStore}>
        <Main />
      </Provider>
    )
  }
}

ReactDOM.render(<Root/>, document.getElementById("app"));