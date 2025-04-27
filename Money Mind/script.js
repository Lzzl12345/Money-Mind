let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let notes = JSON.parse(localStorage.getItem('notes')) || {};
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let debts = JSON.parse(localStorage.getItem('debts')) || [];
let editingDebtIndex = null;
let editingClassIndex = null;

function login() {
    try {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        
        if (username === "user" && password === "password") {
            document.getElementById("loginContainer").style.display = "none";
            document.getElementById("homeContainer").style.display = "block";
            updateDashboard();
        } else {
            alert("Invalid credentials! Try again.");
        }
    } catch (e) {
        console.error("Login error:", e);
    }
}

function logout() {
    try {
        document.getElementById("homeContainer").style.display = "none";
        document.getElementById("loginContainer").style.display = "block";
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    } catch (e) {
        console.error("Logout error:", e);
    }
}

function showSection(sectionId) {
    try {
        const sections = ["homeContainer", "taxContainer", "debtContainer", "calendarContainer", "classesContainer"];
        sections.forEach(id => {
            document.getElementById(id).style.display = id === sectionId ? "block" : "none";
        });
        if (sectionId === "calendarContainer") {
            renderCalendar();
            displayNotes();
        } else if (sectionId === "classesContainer") {
            displayClasses();
        } else if (sectionId === "debtContainer") {
            displayDebts();
        } else if (sectionId === "homeContainer") {
            updateDashboard();
        }
    } catch (e) {
        console.error("Show section error:", e);
    }
}

function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "none";
    } catch (e) {
        console.error("Close modal error:", e);
    }
}

function openClearDataModal() {
    try {
        document.getElementById("clearDataModal").style.display = "flex";
    } catch (e) {
        console.error("Open clear data modal error:", e);
    }
}

function clearAllData() {
    try {
        debts = [];
        notes = {};
        classes = [];
        localStorage.setItem('debts', JSON.stringify(debts));
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.setItem('classes', JSON.stringify(classes));
        closeModal('clearDataModal');
        displayDebts();
        displayNotes();
        displayClasses();
        updateDashboard();
    } catch (e) {
        console.error("Clear data error:", e);
    }
}

function addDebt() {
    try {
        let name = document.getElementById("debtName").value;
        let amount = document.getElementById("debtAmount").value;
        let payment = document.getElementById("monthlyPayment").value;
        let dueDate = document.getElementById("dueDate").value;
        
        if (!name || !amount || !payment || !dueDate) {
            alert("Please fill in all fields.");
            return;
        }
        
        debts.push({ name, amount, payment, dueDate });
        localStorage.setItem('debts', JSON.stringify(debts));
        
        document.getElementById("debtName").value = "";
        document.getElementById("debtAmount").value = "";
        document.getElementById("monthlyPayment").value = "";
        document.getElementById("dueDate").value = "";
        
        displayDebts();
        updateDashboard();
    } catch (e) {
        console.error("Add debt error:", e);
    }
}

function displayDebts() {
    try {
        let debtList = document.getElementById("debtList");
        debtList.innerHTML = "";
        
        debts.forEach((debt, index) => {
            let debtItem = document.createElement("div");
            debtItem.innerHTML = `<span><strong>${debt.name}</strong> - $${debt.amount} | Monthly: $${debt.payment} | Due: ${debt.dueDate}</span>`;
            let editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.textContent = "Edit";
            editBtn.onclick = () => editDebt(index);
            let deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteDebt(index);
            debtItem.appendChild(editBtn);
            debtItem.appendChild(deleteBtn);
            debtList.appendChild(debtItem);
        });
    } catch (e) {
        console.error("Display debts error:", e);
    }
}

function editDebt(index) {
    try {
        editingDebtIndex = index;
        let debt = debts[index];
        document.getElementById("editDebtName").value = debt.name;
        document.getElementById("editDebtAmount").value = debt.amount;
        document.getElementById("editMonthlyPayment").value = debt.payment;
        document.getElementById("editDueDate").value = debt.dueDate;
        document.getElementById("debtModal").style.display = "flex";
    } catch (e) {
        console.error("Edit debt error:", e);
    }
}

function saveDebtEdit() {
    try {
        let name = document.getElementById("editDebtName").value;
        let amount = document.getElementById("editDebtAmount").value;
        let payment = document.getElementById("editMonthlyPayment").value;
        let dueDate = document.getElementById("editDueDate").value;
        
        if (!name || !amount || !payment || !dueDate) {
            alert("Please fill in all fields.");
            return;
        }
        
        debts[editingDebtIndex] = { name, amount, payment, dueDate };
        localStorage.setItem('debts', JSON.stringify(debts));
        closeModal('debtModal');
        displayDebts();
        updateDashboard();
    } catch (e) {
        console.error("Save debt edit error:", e);
    }
}

function deleteDebt(index) {
    try {
        debts.splice(index, 1);
        localStorage.setItem('debts', JSON.stringify(debts));
        displayDebts();
        updateDashboard();
    } catch (e) {
        console.error("Delete debt error:", e);
    }
}

function calculateTax() {
    try {
        let income = parseFloat(document.getElementById("income").value);
        
        if (!income || income < 0) {
            alert("Please enter a valid income.");
            return;
        }
        
        // 2025 US Federal Tax Brackets (Single Filer, simplified)
        let brackets = [
            { limit: 11600, rate: 0.10 },
            { limit: 47150, rate: 0.12 },
            { limit: 100525, rate: 0.22 },
            { limit: 191950, rate: 0.24 },
            { limit: 243725, rate: 0.32 },
            { limit: 609350, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
        ];
        
        let tax = 0;
        let prevLimit = 0;
        let breakdown = "<h3>Tax Breakdown</h3><table><tr><th>Bracket</th><th>Taxable</th><th>Tax</th></tr>";
        
        for (let i = 0; i < brackets.length; i++) {
            let limit = brackets[i].limit;
            let rate = brackets[i].rate;
            let taxable = Math.min(income, limit) - prevLimit;
            if (taxable > 0) {
                let bracketTax = taxable * rate;
                tax += bracketTax;
                breakdown += `<tr><td>$${prevLimit.toLocaleString()} - $${limit.toLocaleString()}</td><td>$${taxable.toLocaleString()}</td><td>$${bracketTax.toFixed(2)}</td></tr>`;
            }
            prevLimit = limit;
            if (income <= limit) break;
        }
        
        breakdown += `</table><p><strong>Total Tax:</strong> $${tax.toFixed(2)}</p>`;
        document.getElementById("taxResult").innerHTML = breakdown;
    } catch (e) {
        console.error("Calculate tax error:", e);
    }
}

function renderCalendar() {
    try {
        const calendar = document.getElementById("calendar");
        const monthYear = document.getElementById("monthYear");
        if (!calendar || !monthYear) {
            console.error("Calendar or monthYear element not found");
            return;
        }
        calendar.innerHTML = "";
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();
        
        monthYear.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}`;
        
        // Add day headers
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        days.forEach(day => {
            let header = document.createElement("div");
            header.className = "header";
            header.textContent = day;
            calendar.appendChild(header);
        });
        
        // Add empty cells
        for (let i = 0; i < startDay; i++) {
            let empty = document.createElement("div");
            empty.className = "empty";
            calendar.appendChild(empty);
        };
        
        // Add days
        for (let day = 1; day <= daysInMonth; day++) {
            let dayDiv = document.createElement("div");
            dayDiv.className = "day";
            dayDiv.textContent = day;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayDiv.onclick = () => {
                const noteDate = document.getElementById("noteDate");
                if (noteDate) noteDate.value = dateStr;
            };
            if (notes[dateStr]) {
                dayDiv.style.backgroundColor = "#d4edda";
            }
            calendar.appendChild(dayDiv);
        }
    } catch (e) {
        console.error("Render calendar error:", e);
    }
}

function prevMonth() {
    try {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
        displayNotes();
    } catch (e) {
        console.error("Previous month error:", e);
    }
}

function nextMonth() {
    try {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
        displayNotes();
    } catch (e) {
        console.error("Next month error:", e);
    }
}

function addNote() {
    try {
        const noteDate = document.getElementById("noteDate");
        const noteText = document.getElementById("noteText");
        if (!noteDate || !noteText) {
            console.error("Note date or text input not found");
            return;
        }
        const date = noteDate.value;
        const text = noteText.value;
        
        if (!date || !text) {
            alert("Please enter a date and note.");
            return;
        }
        
        notes[date] = { text: text };
        localStorage.setItem('notes', JSON.stringify(notes));
        
        noteText.value = "";
        noteDate.value = "";
        
        renderCalendar();
        displayNotes();
        updateDashboard();
    } catch (e) {
        console.error("Add note error:", e);
    }
}

function displayNotes() {
    try {
        const notesList = document.getElementById("notesList");
        if (!notesList) {
            console.error("Notes list element not found");
            return;
        }
        notesList.innerHTML = "";
        
        Object.keys(notes).sort().forEach(date => {
            let noteItem = document.createElement("div");
            noteItem.innerHTML = `<span><strong>${date}</strong>: ${notes[date].text}</span>`;
            let deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteNote(date);
            noteItem.appendChild(deleteBtn);
            notesList.appendChild(noteItem);
        });
    } catch (e) {
        console.error("Display notes error:", e);
    }
}

function deleteNote(date) {
    try {
        delete notes[date];
        localStorage.setItem('notes', JSON.stringify(notes));
        renderCalendar();
        displayNotes();
        updateDashboard();
    } catch (e) {
        console.error("Delete note error:", e);
    }
}

function addClass() {
    try {
        let name = document.getElementById("className").value;
        let dayTime = document.getElementById("classDayTime").value;
        let professor = document.getElementById("classProfessor").value;
        
        if (!name && !dayTime && !professor) {
            alert("Please fill in all fields.");
            return;
        }
        
        classes.push({ name, dayTime, professor });
        localStorage.setItem('classes', JSON.stringify(classes));
        
        document.getElementById("className").value = "";
        document.getElementById("classDayTime").value = "";
        document.getElementById("classProfessor").value = "";
        
        displayClasses();
        updateDashboard();
    } catch (e) {
        console.error("Add class error:", e);
    }
}

function displayClasses() {
    try {
        let classesList = document.getElementById("classesList");
        classesList.innerHTML = "";
        
        classes.forEach((cls, index) => {
            let classItem = document.createElement("div");
            classItem.innerHTML = `<span><strong>${cls.name}</strong> - ${cls.dayTime} | Prof: ${cls.professor}</span>`;
            let editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.textContent = "Edit";
            editBtn.onclick = () => editClass(index);
            let deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteClass(index);
            classItem.appendChild(editBtn);
            classItem.appendChild(deleteBtn);
            classesList.appendChild(classItem);
        });
    } catch (e) {
        console.error("Display classes error:", e);
    }
}

function editClass(index) {
    try {
        editingClassIndex = index;
        let cls = classes[index];
        document.getElementById("editClassName").value = cls.name;
        document.getElementById("editClassDayTime").value = cls.dayTime;
        document.getElementById("editClassProfessor").value = cls.professor;
        document.getElementById("classModal").style.display = "flex";
    } catch (e) {
        console.error("Edit class error:", e);
    }
}

function saveClassEdit() {
    try {
        let name = document.getElementById("editClassName").value;
        let dayTime = document.getElementById("editClassDayTime").value;
        let professor = document.getElementById("editClassProfessor").value;
        
        if (!name || !dayTime || !professor) {
            alert("Please fill in all fields.");
            return;
        }
        
        classes[editingClassIndex] = { name, dayTime, professor };
        localStorage.setItem('classes', JSON.stringify(classes));
        closeModal('classModal');
        displayClasses();
        updateDashboard();
    } catch (e) {
        console.error("Save class edit error:", e);
    }
}

function deleteClass(index) {
    try {
        classes.splice(index, 1);
        localStorage.setItem('classes', JSON.stringify(classes));
        displayClasses();
        updateDashboard();
    } catch (e) {
        console.error("Delete class error:", e);
    }
}

function updateDashboard() {
    try {
        // Total Debt
        let totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
        const totalDebtElement = document.getElementById("totalDebt");
        if (totalDebtElement) totalDebtElement.textContent = `$${totalDebt.toFixed(2)}`;
        
        // Upcoming Notes
        const upcomingNotes = document.getElementById("upcomingNotes");
        if (upcomingNotes) {
            upcomingNotes.innerHTML = "";
            Object.keys(notes).sort().forEach(date => {
                let noteItem = document.createElement("div");
                noteItem.innerHTML = `<span><strong>${date}</strong>: ${notes[date].text}</span>`;
                upcomingNotes.appendChild(noteItem);
            });
        }
        
        // Weekly Classes
        const weeklyClasses = document.getElementById("weeklyClasses");
        if (weeklyClasses) {
            weeklyClasses.innerHTML = "";
            classes.forEach(cls => {
                let classItem = document.createElement("div");
                classItem.innerHTML = `<span><strong>${cls.name}</strong> - ${cls.dayTime} | Prof: ${cls.professor}</span>`;
                weeklyClasses.appendChild(classItem);
            });
        }
    } catch (e) {
        console.error("Update dashboard error:", e);
    }
}