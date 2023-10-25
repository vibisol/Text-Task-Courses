import {Component} from 'react';
import CourseInfo from '../Teachers/Teachers';


class App extends Component {
    

    render(){
        return (
            <div className="app">
               
                <main>
                 
                    <div className="course">
                       
                       <CourseInfo/>
                    </div>
                   
                </main>
            </div>
        )
    }
}

export default App;