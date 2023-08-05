import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [variables, setVars] = useState("");
  const [values, setVals] = useState("");
  const [func, setFunc] = useState("");
  const [selectedInput, setSelectedInput] = useState("VariableInput"); 
  const [funcOut, setFuncOut] = useState("");
  const [partOut, setPartOut] = useState("");

  const handleInputSelect = (inputType) => {
    setSelectedInput(inputType);
  };

  const handleCalculateClick = () => {
    if (variables.length === 0){
      return;
    }
    if (values.length === 0){
      return;
    }
    if (func.length === 0){
      return;
    }
    let function_str = "";
    let visited_indices = [];

    for (let i = 0; i < func.length; i++) {
      let element = func[i];

      if (visited_indices.includes(i)) {
        continue;
      }

      if (element === "^") {
        function_str += "**";
      } 
      else if (!isNaN(element)) {
        let total_num = element;

        for (let j = i + 1; j < func.length; j++) {
          visited_indices.push(j);

          if (!isNaN(func[j])) {
            total_num += func[j];
          } else {
            visited_indices.pop();
            break;
          }
        }

        function_str += `Constant(${total_num})`;
      }
      else {
        function_str += element;
      }
    }
  
    const formData = new FormData();
    formData.append('variables', variables);
    formData.append('eval_values', values);
    formData.append('function', function_str);
    
    fetch("/partials", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setFuncOut(data.forward);
        setPartOut(data.partials);
      })
  }

  const handleButtonClick = (value) => {
    if (selectedInput === "VariableInput") {
      if (variables.length === 0){
        setVars(value);
      }
      else{
        setVars(variables + ", " + value);
      }
    } 
    else if (selectedInput === "ValueInput") {
      if (values.length === 0){
        setVals(value);
      }
      else{
        setVals(values + ", " + value);
      }
    } 
    else if (selectedInput === "FunctionInput") {
      setFunc(func + value);
    }
  };

  const handleClearClick = () => {
    setFunc("");
    setVals("");
    setVars("");
    setFuncOut("");
    setPartOut("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (key === "Backspace"){
        if (selectedInput === "VariableInput"){
          setVars(variables.slice(0, -3));
        }
        else if (selectedInput === "ValueInput"){
          setVals(values.slice(0, -3));
        }
        else{
          setFunc(func.slice(0, -1));
        }
      }
      else if (key === "Shift"){
        
      }
      else{
        handleButtonClick(key);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedInput, variables, values, func, handleButtonClick]);

  const importNumbers = () => {
    const numbers = [];
    for (let i = 0; i < 10; i++) {
      numbers.push(<button onClick={() => handleButtonClick(i.toString())} key={i}>{i}</button>);
    }
    return numbers;
  }

  const importVariables = () => {
    const variables = [];
    for (let i = 97; i < 123; i++) {
      variables.push(<button onClick={() => handleButtonClick(String.fromCharCode(i))} key={i}>{String.fromCharCode(i)}</button>);
    }
    for (let i = 65; i < 91; i++) {
      variables.push(<button onClick={() => handleButtonClick(String.fromCharCode(i))} key={i}>{String.fromCharCode(i)}</button>);
    }
    return variables;
  }

  return (
    <div className="App">
      <div className='userEntries'>
        <div className='VariableInput' onClick={() => handleInputSelect("VariableInput")}>
          {variables || "Enter Variables"}
        </div>
        <div className='ValueInput' onClick={() => handleInputSelect("ValueInput")}>
          {values || "Enter Values To Evaluate At"}
        </div>
        <div className='FunctionInput' onClick={() => handleInputSelect("FunctionInput")}>
          {func || "Enter Function"}
        </div>
      </div>
  
      <div className="Keypad">
        <div className="Operators">
          <button onClick={() => handleButtonClick('Log')}>Log</button>
          <button onClick={() => handleButtonClick('Sin')}>Sin</button>
          <button onClick={() => handleButtonClick('Cos')}>Cos</button>
          <button onClick={() => handleButtonClick('+')}>+</button>
          <button onClick={() => handleButtonClick('-')}>-</button>
          <button onClick={() => handleButtonClick('/')}>/</button>
          <button onClick={() => handleButtonClick('*')}>*</button>
          <button onClick={() => handleButtonClick('^')}>^</button>
          <button onClick={() => handleButtonClick('(')}>(</button>
          <button onClick={() => handleButtonClick(')')}>)</button>
        </div>
        <div className="Numbers">
          {importNumbers()}
        </div>
        <div className="Variables">
          {importVariables()}
        </div>
        <div className="calculate">
          <button onClick={handleCalculateClick}>Calculate</button>
          <button onClick={handleClearClick}>Clear</button>
        </div>
      </div>

      <div className='Outputs'>
        <div className='FuncOut'>
          {funcOut || "Function Output"}
        </div>
        <div className='PartOut'>
          {partOut || "Partial Derivatives"}
        </div>
      </div>
    </div>
  );
}

export default App;
