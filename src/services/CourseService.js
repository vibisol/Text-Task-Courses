class CourseService{
   
    
    getResource = async (url) => {
        let res = await fetch(url);
    
        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }
    
        return await res.json();
    }

    getAllDate = async () => {
        const res = await this.getResource("https://bgaa.by/test");
    
       console.log(res)
        return res.data.map(this._transformDate);
    }

    getAllTeachers = async () => {
        const res = await this.getResource("https://bgaa.by/test");
    
       
        return res.teachers.map(this._transformTeacher);
    }

  

    _transformDate = (char) => {
        return {
            exam:char.exam,
            groupName:char.groupName,
            laboratoryHours:char.laboratoryHours,
            lecturesHours:char.lecturesHours,
            offset:char.offset,
            practicHours:char.practicHours,
            semestr:char.semestr,
            seminarHours:char.seminarHours,
            studentsNumber:char.studentsNumber,
            subjectName:char.subjectName,
            course:char.course

        }
    }
    _transformTeacher = (char1) => {
        return {
            id: char1.id,
            name: char1.name
        }
    }
}

export default CourseService;