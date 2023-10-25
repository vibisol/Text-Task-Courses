import React from 'react';
import CourseService from '../../services/CourseService';

import './style.css';
import trash from '../../resources/img/trash.png';

class CourseInfo extends React.Component {

  state = {
    data: [],
    teachers: [],
    error: false,
    subgroups: [],
    subgroupStudents: [],
    notes: {} 
 }

  courseService = new CourseService();

  componentDidMount() {
    this.onRequestDate();
    this.onRequestTeacher();
  }
  
  onRequestTeacher = () => {
    this.courseService.getAllTeachers()
    .then(this.onTeachersLoaded)
    .catch(this.onError);
  }

  onRequestDate = () => {
    this.courseService.getAllDate()
    .then(this.onDataLoaded)
    .catch(this.onError);
  }

  onDataLoaded = (data) => {
    const enhancedData = data.map(item => ({
      ...item,
      subgroups: 1,
      secondSubgroupStudents: 0,
      selectedTeacherForExam: item.teacher || 'Вакансия', 
    }));
    this.setState({ data: enhancedData });
   
  }

  onTeachersLoaded = (teachers) => {
    this.setState({ teachers });
  }

  onError = () => {
    this.setState({
        error: true
    });
  }

  addSubgroup = (index) => {
    this.setState(prevState => {
        const newData = [...prevState.data];
        const newSubgroupStudents = [...prevState.subgroupStudents];
        
        if (newData[index].subgroups === 1) {
            newData[index].subgroups = 2;
            newData[index].subgroupStudentsNumber = Math.floor(newData[index].studentsNumber / 2);
            
            newSubgroupStudents[index] = newData[index].subgroupStudentsNumber; 
        }
        return { data: newData, subgroupStudents: newSubgroupStudents };
    });
  }

  removeSubgroup = (index) => {
      this.setState(prevState => {
          const newData = [...prevState.data];
          newData[index].subgroups = 1;
          newData[index].subgroupStudentsNumber = 0;
          return { data: newData };
      });
  }

  

  handleExamTeacherChange = (index, teacherId) => {
    this.setState(prevState => {
      const newData = [...prevState.data];
      newData[index].selectedTeacherForExam = teacherId;
      return { data: newData };
    });
  }

  
  saveData = () => {
    
    const { data, notes } = this.state;
    const dataToSend = data.map(item => ({
        ...item,
        note: notes[item.uniqueId] || ''
    }));

    console.log(dataToSend);

 
    fetch('https://bgaa.by/test_result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Ошибка:', error));
  }

  handleStudentCountChange = (e, index, subgroupNumber) => {
    const value = parseInt(e.target.value);
    this.setState(prevState => {
        const newData = [...prevState.data];
        let newSubgroupStudents = [...prevState.subgroupStudents];

     
        if (!newSubgroupStudents[index]) {
            newSubgroupStudents[index] = 0;
        }

        if (subgroupNumber === 1) {
            newData[index].firstSubgroupStudents = value;
            newData[index].secondSubgroupStudents = newData[index].studentsNumber - value;
            newSubgroupStudents[index] = value;
        } else {
            newData[index].secondSubgroupStudents = value;
            newData[index].firstSubgroupStudents = newData[index].studentsNumber - value;
        }
        return { data: newData, subgroupStudents: newSubgroupStudents };
    });
  }
  
  handleTeacherChange = (e, columnName, index) => {
    const selectedTeacherId = e.target.value;
    this.setState(prevState => {
      const newData = [...prevState.data];
      newData[index][columnName + 'Teacher'] = selectedTeacherId;
      return { data: newData };
    });
  }

  handleSecondSubgroupTeacherChange = (index, teacherId) => {
    this.setState(prevState => {
      const newData = [...prevState.data];
      newData[index].secondSubgroupTeacher = teacherId;
      return { data: newData };
    });
  }

  handleNoteChange = (e, uniqueId) => {
    const value = e.target.value;
    this.setState(prevState => ({
        notes: {
            ...prevState.notes,
            [uniqueId]: value
        }
    }));
  }

  renderTeacherColumn(item, columnName, index) {
    return (
        <td>
            <select 
                onChange={(e) => this.handleTeacherChange(e, columnName, index)}
                disabled={item[columnName] == 0}  
                defaultValue={item[columnName] == 0 ? "Вакансия" : undefined}  
            >
                <option value="vacancy">Вакансия</option>
                {this.state.teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                    </option>
                ))}
            </select>
        </td>
    );
  }


  render() {

    const { data, teachers, error } = this.state;

    if (error) {
        return <div>Произошла ошибка!</div>;

    }

    const columnNamesMapping = {
      lecturesHours: "Лекции",
      laboratoryHours: "Лабораторные работы",
      practicHours: "Практические",
      seminarHours: "Семинарские"
    };

    return (
      <div>
        {data.map((item,index) => (
          <div  key={item.uniqueId} style={{paddingTop: '20px'}} className='mainDiv'>
            <h3>Конкретная авиационная техника (1-37 04 02-01)</h3>

              <div className='infoGroup'>

                  <div className='infoGroupPart_1'> 
                    <div className='infoGroupName'> <p>Группа: </p> <p>{item.groupName}</p></div>
                    <div className='infoGroupCourse'><p>Курс: </p> <p>{item.course}</p></div>
                  </div>

                  <div className='infoGroupPart_2'>
                    <div className='infoGroupStNumber'> <p>Количество курсантов:</p> <p className='infoGroupNumber'> {item.studentsNumber}</p></div>
                      <div className='infoGroupSemestr'><p>Семестр: </p> <p>{item.semestr}</p></div>
                  </div>
                      
                </div>
                  
                <table>
                  <thead>
                    <tr>
                      <th>Занятие</th>
                      <th>Часы</th>
                        {item.subgroups <= 1 ? <th style={{ display: 'flex', justifyContent: 'center', alignItems:'center' }}>Преподаватель <button onClick={() => this.addSubgroup(index)}>+</button></th>  : null}
                        {item.subgroups > 1 && <th>Подгруппа 1</th>}
                        {item.subgroups > 1 && 
                          <th style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                              Подгруппа 2 
                                {item.subgroups > 1 && 
                                  <img 
                                    src={trash} 
                                    alt="Удалить подгруппу" 
                                    onClick={() => this.removeSubgroup(index)} 
                                    style={{ cursor: 'pointer', width: '20px', height: '20px' }} 
                                  />
                                }
                          </th>
                          }      
                    </tr>
                  </thead>
                  <tbody>
                     {['lecturesHours', 'laboratoryHours', 'practicHours', 'seminarHours'].map(columnName => (
                       <>
                        <tr key={columnName}>
                            <td>{columnNamesMapping[columnName]}</td>
                            <td>{item[columnName]}</td>
                             {this.renderTeacherColumn(item, columnName, index)}
                             {item.subgroups > 1 && this.renderTeacherColumn(item, columnName, index)}
                        </tr>
                       </>
                     ))}
                      {item.exam || item.offset ? (
                          <tr>
                            <td>{item.exam ? 'Экзамен' : 'Зачёт'}</td>
                            <td>{item.exam}</td>
                              <td>
                                  <select 
                                    value={item.selectedTeacherForExam} 
                                    onChange={(e) => this.handleExamTeacherChange(index, e.target.value)}
                                  >
                                    <option value="Вакансия">Вакансия</option>
                                      {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>
                                              {teacher.name}
                                          </option>
                                      ))}
                                  </select>
                              </td>

                              {item.subgroups > 1 && 
                                  <td>
                                      <select 
                                          value={item.secondSubgroupTeacher || 'Вакансия'} 
                                          onChange={(e) => this.handleSecondSubgroupTeacherChange(index, e.target.value)}
                                        >
                                          <option value="Вакансия">Вакансия</option>
                                              {teachers.map(teacher => (
                                                <option key={teacher.id} value={teacher.id}>
                                                  {teacher.name}
                                                </option>
                                              ))}
                                      </select>
                                  </td>
                              }
                            </tr>
                        ) : null
                      }
                        {item.subgroups > 1 && 
                                  <tr>
                                      <td>Количество человек</td>
                                      <td></td> 
                                      <td>
                                          <input 
                                              type="number" 
                                              value={this.state.subgroupStudents[index]} 
                                              onChange={(e) => this.handleStudentCountChange(e, index, 1)}
                                          />
                                      </td>
                                      <td>
                                          <input 
                                              type="number" 
                                              value={item.studentsNumber - this.state.subgroupStudents[index]} 
                                              onChange={(e) => this.handleStudentCountChange(e, index, 2)}
                                          />
                                      </td>
                                  </tr>
                        }

                         <tr>
                                <td >
                                    Примечание: 
                                </td>
                                <td></td> 
                                <td colSpan={item.subgroups > 1 ? "2" : "1"}>
                                    <textarea 
                                        style={{ width: '100%' }} 
                                        value={this.state.notes[item.uniqueId] || ''} 
                                        onChange={(e) => this.handleNoteChange(e, item.uniqueId)}
                                    />
                                </td>
                          </tr>
                        </tbody>
                  </table>


                    <button className='buttonSave' onClick={this.saveData}>Сохранить</button>
              </div>
            ))}
      </div>
    );
  }

}

export default CourseInfo;



          