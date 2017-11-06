import React from "react";
import ReactDOM from "react-dom";
const $ = require("jquery");

const app = $('#app')[0];
const friendlyPresets = require("./friendlyPresets");

class HackingInput extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      value:this.props.preset
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    this.setState({value: event.target.value});
    this.props.onChange(event.target.value);
  }
  handleKeyPress (event){
    // allow the tabs key (this is so we can properly input yaml)
    if (event.keyCode === 9) { // tab was pressed
      event.preventDefault();
      var val = this.state.value,
      start = event.target.selectionStart,
      end = event.target.selectionEnd;
      this.setState(
        {
          "value": val.substring(0, start) + '\t' + val.substring(end)
        },
        () => {
          this.refs.input.selectionStart = this.refs.input.selectionEnd = start + 1;
        }
      );
    }
  }
  render() {
    return (
      <textarea ref="input" onKeyDown={this.handleKeyPress.bind(this)} className="float-left hacking-input" value={this.state.value} onChange={this.handleChange} wrap="off"/>
    );
  }
}
class HackingForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      text:friendlyPresets.injection,
      script:friendlyPresets.script
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addScript = this.addScript.bind(this);
    this.addText = this.addText.bind(this);
  }
  addScript(text){
    this.setState({script:text});
  }
  addText(text){
    this.setState({text:text});
  }
  handleSubmit(event) {
    $.ajax({
      type: "POST",
      url: "/api/test",
      data: this.state,
      dataType: "application/json"
    })
    .always(
      (data) => {
        this.props.updateOutput(
          JSON.parse(data.responseText)
        );
      }
    );
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  render() {
    return (
      <form id="hackingForm" onSubmit={this.handleSubmit}>
        <HackingInput onChange={this.addScript} preset={friendlyPresets.script}/>
        <HackingInput onChange={this.addText} preset={friendlyPresets.injection}  />
        <input className="hacking-submit" type="submit" value="Run"/>
      </form>
    );
  }
}
class HackingOutput extends React.Component{
  constructor (props){
    super(props);
  }
  render () {
    var serverClass = "";
    var injectClass = "";
    if (this.props.responseInfo.responseCode != 200 && this.props.responseInfo.responseCode != ""){
      serverClass = "injection-failure";
    }
    if (this.props.responseInfo.injectCode != 200 && this.props.responseInfo.injectCode != ""){
      injectClass="injection-failure";
    }
    var hidden = "";
    if (this.props.responseInfo.responseCode == "" && this.props.responseInfo.injectCode == ""){
      hidden = "hidden";
    }
    return (
      <div className="hacking-output">
        <pre className={"hacking-output " + this.props.currentClass}>
          {this.props.currentText}
        </pre>
        <div className={"col-md-12 " + hidden}>
          <span className={serverClass}>Response Code: {this.props.responseInfo.responseCode.toString()}</span>
          <span> </span>{/* The character preceeding this comment is a space between these two codes.*/}
          <span className={injectClass}>Injection Request Code: {this.props.responseInfo.injectCode.toString()}</span>
        </div>
      </div>
    );
  }
}

class Root extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      text:"",
      passed:null,
      currentClass:"injection-null",
      responseInfo:{
        responseCode:"",
        injectCode:""
      }
    };
    this.updateOutput = this.updateOutput.bind(this);
  }
  updateOutput(data){
    var thisClass = "";
    switch(data.success){
      case true:
        thisClass = "injection-success";
        break;
      case false:
        thisClass = "injection-failure";
        break;
      default:
        thisClass = "injection-null";
        break;
    }
    
    this.setState({
      text:data.server_response_text,
      passed:data.success,
      currentClass:thisClass,
      responseInfo:{
        responseCode:data.server_response_code,
        injectCode:data.inject_response_code
      }
    });
  }
  render() {
    return (
      <div>
        <div className="col-xs-12" align="center">
          <div className="col-md-6 float-left" align="center">
            <HackingOutput currentClass={this.state.currentClass} currentText={this.state.text} responseInfo={this.state.responseInfo}/>
          </div>
          <div className="col-md-6 float-right" align="center">
            <HackingForm updateOutput={this.updateOutput}/>
          </div>
        </div>
      </div>
    );
  }
}


ReactDOM.render(
  <Root/>,
  app
);
