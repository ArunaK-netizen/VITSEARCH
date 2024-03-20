document.addEventListener("DOMContentLoaded", function () {
    let user_input = document.getElementById("input");
    let user_value = user_input.value;
    let teacherNames = [];
    let cabins = [];
    let department = [];
    let imagelinks = [];
    let teachercard = document.getElementById("teachercard");
    let resultbox = document.getElementById("resultlistContainer");

    async function fetchTeachers() {
        try {
            const response = await fetch('cabins.json');
            const data = await response.json();
            teacherNames = data.map(teacher => teacher.name);
            cabins = data.map(teacher => teacher.cabin);
            department = data.map(teacher => teacher.dept);
            imagelinks = data.map(teacher=>teacher.image);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    }
    fetchTeachers();

    user_input.onkeyup = function() {
        let result = [];
        let userInputValue = user_input.value;
        if (userInputValue.length) {
            result = teacherNames.filter((name) => {
                return name.toLowerCase().includes(userInputValue.toLowerCase());
            });
        }
        let resultlist = document.querySelectorAll(".result");
        result = result.slice(0,10);
        resultlist = Array.from(resultlist).slice(0, 10);
        display(result, resultlist);
    }
    
    function display(result, resultlist) {
        const content = result.map((list) => {
            return "<li class='result'>" + list + "</li>";
        });
        resultbox.innerHTML = "<ul>" + content.join('') + "</ul>";
        
        let resultlistContainer = document.getElementById("resultlistContainer");
        resultlistContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('result')) {
                const index = Array.from(teacherNames).indexOf(event.target.textContent);
                const selectedTeacher = {
                    name: teacherNames[index],
                    cabin: cabins[index],
                    dept: department[index]
                    
                    
                };
                resultbox.innerHTML = "";
                let cards = document.getElementById("cards");
                cards.style.display = "flex";
                let teachercardname = document.getElementById("teachername");
                teachercardname.textContent = teacherNames[index];
                let teachercardcabin = document.getElementById("teachercardcabin");
                teachercardcabin.textContent = cabins[index];

                let image = document.getElementById("image");
                if(imagelinks[index] != null){
                    image.src = imagelinks[index];
                }
                
            }

        });
        
    }
});
