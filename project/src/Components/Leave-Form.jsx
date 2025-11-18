import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Calendar, ArrowLeft, Eye } from "lucide-react";
import styles from "../Styles/Leave-Form.module.css";

export default function LeaveForm() {
  const [employees, setEmployees] = useState([]);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [defaultLeaveDays, setDefaultLeaveDays] = useState(39);
  const [currentView, setCurrentView] = useState("main");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedLeaveType, setSelectedLeaveType] = useState("vacation");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  // 🆕 สถานะใหม่: ใช้เก็บข้อความที่ใช้กรองชื่อพนักงาน
  const [nameFilter, setNameFilter] = useState("");
  // 🆕 สถานะใหม่: ใช้เก็บหมายเลขหน้าปัจจุบันสำหรับ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 8; // กำหนดจำนวนพนักงานต่อหน้า

  // To ensure selectedEmployee is updated after an action in the main view
  useEffect(() => {
    if (selectedEmployee) {
      const updatedEmp = employees.find((e) => e.id === selectedEmployee.id);
      if (
        updatedEmp &&
        JSON.stringify(updatedEmp) !== JSON.stringify(selectedEmployee)
      ) {
        setSelectedEmployee(updatedEmp);
      }
    }
  }, [employees, selectedEmployee]);

  // 🆕 Reset หน้าปัจจุบันเมื่อมีการกรอง
  useEffect(() => {
    setCurrentPage(1);
  }, [nameFilter]);

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    // Use 'th-TH' for Thai locale and Buddhist year
    const month = now.toLocaleDateString("th-TH", { month: "long" });
    const year = now.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const getMonthName = (month) => {
    const months = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    return months[month];
  };

  const addEmployee = () => {
    if (newEmployeeName.trim() === "") return;

    const newEmployee = {
      id: Date.now(),
      name: newEmployeeName,
      late: 0,
      absent: 0, // Now calculated from leaveRecords
      vacation: 0, // Now calculated from leaveRecords
      personal: 0, // Now calculated from leaveRecords
      sick: 0, // Now calculated from leaveRecords
      note: "",
      remainingLeave: defaultLeaveDays,
      leaveRecords: [],
    };

    setEmployees([...employees, newEmployee]);
    setNewEmployeeName("");
  };

  const updateEmployee = (id, field, value) => {
    setEmployees(
      employees.map((emp) => (emp.id === id ? { ...emp, [field]: value } : emp))
    );
  };

  const handleNameEdit = (id, newName) => {
    if (editingEmployeeId === id) {
      // โหมดบันทึก: ตรวจสอบและบันทึกชื่อ
      if (newName.trim() === "") {
        alert("ชื่อพนักงานไม่สามารถว่างเปล่าได้");
        return;
      }
      updateEmployee(id, "name", newName);
      setEditingEmployeeId(null); // ปิดโหมดแก้ไข
    } else {
      // โหมดเริ่มแก้ไข
      setEditingEmployeeId(id);
    }
  };

  const handleKeyPress = (e, id, newName) => {
    if (e.key === "Enter") {
      handleNameEdit(id, newName);
      e.target.blur();
    }
    if (e.key === "Escape") {
      setEditingEmployeeId(null);
    }
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const calculateRemaining = (emp) => {
    return emp.remainingLeave - emp.vacation - emp.personal - emp.sick;
  };

  const viewCalendar = (employee) => {
    setSelectedEmployee(employee);
    setCurrentView("calendar");
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return new Date(year, month, 1).getDay();
  };

  const addLeaveRecord = (day, leaveType) => {
    if (!selectedEmployee || !leaveType) return;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    setEmployees((prevEmployees) => {
      return prevEmployees.map((emp) => {
        if (emp.id === selectedEmployee.id) {
          const existingRecordIndex = emp.leaveRecords.findIndex(
            (r) => r.date === dateStr
          );
          let newRecords;

          if (existingRecordIndex !== -1) {
            const existingType = emp.leaveRecords[existingRecordIndex].type;

            if (existingType === leaveType) {
              // Remove if same type (toggle off)
              newRecords = emp.leaveRecords.filter((r) => r.date !== dateStr);
            } else {
              // Update to new type
              newRecords = emp.leaveRecords.map((r) =>
                r.date === dateStr ? { ...r, type: leaveType } : r
              );
            }
          } else {
            // Add new record
            newRecords = [
              ...emp.leaveRecords,
              { date: dateStr, type: leaveType },
            ];
          }

          // Calculate totals from records
          const vacation = newRecords.filter(
            (r) => r.type === "vacation"
          ).length;
          const personal = newRecords.filter(
            (r) => r.type === "personal"
          ).length;
          const sick = newRecords.filter((r) => r.type === "sick").length;
          const absent = newRecords.filter((r) => r.type === "absent").length;

          return {
            ...emp,
            leaveRecords: newRecords,
            vacation,
            personal,
            sick,
            absent,
          };
        }
        return emp;
      });
    });
  };

  const getLeaveTypeForDate = (day) => {
    if (!selectedEmployee) return null;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    // Get latest employee data (Important!)
    const currentEmp = employees.find((e) => e.id === selectedEmployee.id);
    if (!currentEmp) return null;

    const record = currentEmp.leaveRecords.find((r) => r.date === dateStr);
    return record ? record.type : null;
  };

  const changeMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case "vacation":
        return styles.leaveVacation;
      case "personal":
        return styles.leavePersonal;
      case "sick":
        return styles.leaveSick;
      case "absent":
        return styles.leaveAbsent;
      default:
        return "";
    }
  };

  const getLeaveTypeLabel = (type) => {
    switch (type) {
      case "vacation":
        return "พักร้อน";
      case "personal":
        return "ลากิจ";
      case "sick":
        return "ลาป่วย";
      case "absent":
        return "ขาดงาน";
      default:
        return "";
    }
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

    // การคำนวณวันปัจจุบัน (Today)
    const today = new Date();
    const isCurrentMonthYear =
      today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const todayDate = isCurrentMonthYear ? today.getDate() : null;

    // Get current employee data
    const currentEmp = employees.find((e) => e.id === selectedEmployee?.id);

    // Placeholder for empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.dayEmpty}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const leaveType = getLeaveTypeForDate(day);

      // 1. ตรวจสอบว่าเป็นวันปัจจุบันหรือไม่
      const isToday = day === todayDate;

      // 2. ตรวจสอบว่าเป็นวันอาทิตย์ (firstDay คือ 0 = อาทิตย์)
      const dayIndex = (firstDay + day - 1) % 7;
      const isSunday = dayIndex === 0;

      const dayClasses = [
        styles.dayCell,
        leaveType ? getLeaveTypeColor(leaveType) : styles.dayCellDefault,
        isToday ? styles.dayCellToday : "", // เพิ่ม class สำหรับวันปัจจุบัน
      ];

      if (!leaveType) {
        dayClasses.push(styles.dayCellHover);
      }

      days.push(
        <div
          key={day}
          onClick={() => addLeaveRecord(day, selectedLeaveType)}
          className={dayClasses.join(" ")}
        >
          <div
            className={`${styles.dayNumber} ${
              leaveType ? styles.dayNumberLeave : styles.dayNumberDefault
            } ${isSunday ? styles.dayNumberSunday : ""}`}
          >
            {day}
          </div>
          {isToday && <div className={styles.todayLabel}>วันนี้</div>}

          {leaveType && (
            <div className={styles.dayLeaveLabel}>
              {getLeaveTypeLabel(leaveType)}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.calendarWrapper}>
          <div className={styles.card}>
            {/* Header */}
            <div className={styles.calendarHeader}>
              <button
                onClick={() => setCurrentView("main")}
                className={styles.backButton}
              >
                <ArrowLeft className={styles.iconSmall} />
                กลับ
              </button>
              <h2 className={styles.calendarTitle}>
                ปฏิทินการลา: {currentEmp?.name}
              </h2>
              <div></div>
            </div>

            {/* Month Navigation */}
            <div className={styles.calendarNav}>
              <button
                onClick={() => changeMonth("prev")}
                className={styles.navButton}
              >
                ← เดือนก่อนหน้า
              </button>
              <h3 className={styles.calendarMonthYear}>
                {getMonthName(currentMonth)} {currentYear + 543}
              </h3>
              <button
                onClick={() => changeMonth("next")}
                className={styles.navButton}
              >
                เดือนถัดไป →
              </button>
            </div>

            {/* Leave Type Selector */}
            <div classNameName={styles.typeSelectorContainer}>
              <p className={styles.typeSelectorLabel}>
                เลือกประเภทการลา จากนั้นคลิกที่วันในปฏิทิน:
              </p>
              <div className={styles.typeButtonWrapper}>
                {[
                  {
                    type: "vacation",
                    label: "ลาพักร้อน",
                    colorClass: styles.vacationButton,
                    activeColorClass: styles.vacationButtonActive,
                    dotColor: styles.dotVacation,
                  },
                  {
                    type: "personal",
                    label: "ลากิจ",
                    colorClass: styles.personalButton,
                    activeColorClass: styles.personalButtonActive,
                    dotColor: styles.dotPersonal,
                  },
                  {
                    type: "sick",
                    label: "ลาป่วย",
                    colorClass: styles.sickButton,
                    activeColorClass: styles.sickButtonActive,
                    dotColor: styles.dotSick,
                  },
                  {
                    type: "absent",
                    label: "ขาดงาน",
                    colorClass: styles.absentButton,
                    activeColorClass: styles.absentButtonActive,
                    dotColor: styles.dotAbsent,
                  },
                ].map(
                  ({ type, label, colorClass, activeColorClass, dotColor }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedLeaveType(type)}
                      className={`${styles.typeButton} ${colorClass} ${
                        selectedLeaveType === type ? activeColorClass : ""
                      }`}
                    >
                      <div className={`${styles.dot} ${dotColor}`}></div>
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className={styles.calendarGrid}>
              {dayNames.map((day, index) => (
                <div
                  key={day}
                  className={`${styles.dayNameHeader} ${
                    index === 0 ? styles.sundayHeader : ""
                  }`}
                >
                  {day}
                </div>
              ))}
              {days}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🆕 การกรองและการแบ่งหน้า
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }, [employees, nameFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * employeesPerPage,
    currentPage * employeesPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (currentView === "calendar") {
    return renderCalendarView();
  }

  // Main Employee List View
  return (
    <div className={styles.container}>
      <div className={styles.mainWrapper}>
        {/* Header and Add Employee Form */}
        <div className={`${styles.card} ${styles.headerCard}`}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.mainTitle}>ระบบบันทึกการลาพนักงาน</h1>
              <div className={styles.dateInfo}>
                <Calendar className={styles.iconSmall} />
                <span className={styles.dateText}>{getCurrentDate()}</span>
              </div>
            </div>
          </div>

          {/* Add Employee Form & Filter */}
          <div className={styles.addEmployeeForm}>
            {/* 1. Add Employee Name Input */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>ชื่อพนักงาน</label>
              <input
                type="text"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addEmployee()}
                placeholder="กรอกชื่อพนักงาน"
                className={styles.textInput}
              />
            </div>
            {/* 2. Default Leave Days Input */}
            <div className={styles.inputGroupSmall}>
              <label className={styles.inputLabel}>จำนวนวันลาเริ่มต้น</label>
              <input
                type="number"
                value={defaultLeaveDays}
                onChange={(e) => setDefaultLeaveDays(Number(e.target.value))}
                min="0"
                className={styles.numberInput}
              />
            </div>
            {/* 🆕 3. Name Filter Input */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>กรองชื่อพนักงาน</label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="ค้นหาชื่อ"
                className={styles.textInput}
              />
            </div>
            {/* 4. Add Button */}
            <button onClick={addEmployee} className={styles.addButton}>
              <Plus className={styles.iconSmall} />
              เพิ่มพนักงาน
            </button>
          </div>
        </div>

        {/* Employee Table */}
        {employees.length > 0 && (
          <div className={styles.tableContainer}>
            <div className={styles.tableScroll}>
              <table className={styles.employeeTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.thLeft}>ชื่อพนักงาน</th>
                    <th className={styles.thCenter}>สาย (ครั้ง)</th>
                    <th className={styles.thCenter}>ขาดงาน (วัน)</th>
                    <th className={styles.thCenter}>ลาพักร้อน (วัน)</th>
                    <th className={styles.thCenter}>ลากิจ (วัน)</th>
                    <th className={styles.thCenter}>ลาป่วย (วัน)</th>
                    <th className={styles.thCenter}>จำนวนลาเริ่มต้น</th>
                    <th className={styles.thCenter}>จำนวนลาที่เหลือ</th>
                    <th className={styles.thLeft}>หมายเหตุ</th>
                    <th className={styles.thCenter}>จัดการ</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {currentEmployees.map((emp, index) => { // 🆕 ใช้ currentEmployees แทน employees
                    const remaining = calculateRemaining(emp);
                    const remainingClass =
                      remaining < 0
                        ? styles.remainingNegative
                        : remaining <= 2
                        ? styles.remainingWarning
                        : styles.remainingPositive;

                    const isEditing = editingEmployeeId === emp.id;

                    return (
                      <tr
                        key={emp.id}
                        className={
                          index % 2 === 0 ? styles.trEven : styles.trOdd
                        }
                      >
                        <td className={styles.td}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={emp.name}
                              onChange={(e) =>
                                updateEmployee(emp.id, "name", e.target.value)
                              }
                              onBlur={() => handleNameEdit(emp.id, emp.name)}
                              onKeyPress={(e) =>
                                handleKeyPress(e, emp.id, emp.name)
                              }
                              autoFocus
                              className={styles.nameEditInput}
                              style={{
                                width: "100%",
                                padding: "4px",
                                boxSizing: "border-box",
                              }}
                            />
                          ) : (
                            <span
                              className={styles.employeeName}
                              onClick={() => setEditingEmployeeId(emp.id)}
                              title="คลิกเพื่อแก้ไขชื่อ"
                            >
                              {emp.name}
                            </span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <input
                            type="number"
                            value={emp.late}
                            onChange={(e) =>
                              updateEmployee(
                                emp.id,
                                "late",
                                Number(e.target.value)
                              )
                            }
                            min="0"
                            className={styles.numberInputSmall}
                          />
                        </td>
                        <td className={styles.td}>
                          <div className={styles.dataAbsent}>{emp.absent}</div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.dataVacation}>
                            {emp.vacation}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.dataPersonal}>
                            {emp.personal}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.dataSick}>{emp.sick}</div>
                        </td>
                        <td className={styles.td}>
                          <input
                            type="number"
                            value={emp.remainingLeave}
                            onChange={(e) =>
                              updateEmployee(
                                emp.id,
                                "remainingLeave",
                                Number(e.target.value)
                              )
                            }
                            min="0"
                            className={styles.numberInputSmall}
                          />
                        </td>
                        <td className={styles.td}>
                          <div
                            className={`${styles.remainingValue} ${remainingClass}`}
                          >
                            {remaining}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <input
                            type="text"
                            value={emp.note}
                            onChange={(e) =>
                              updateEmployee(emp.id, "note", e.target.value)
                            }
                            placeholder="หมายเหตุ"
                            className={styles.noteInput}
                          />
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actions}>
                            <button
                              onClick={() => viewCalendar(emp)}
                              className={styles.actionButtonView}
                              title="ดูปฏิทินการลา"
                            >
                              <Eye className={styles.iconSmall} />
                            </button>
                            <button
                              onClick={() => deleteEmployee(emp.id)}
                              className={styles.actionButtonDelete}
                              title="ลบพนักงาน"
                            >
                              <Trash2 className={styles.iconSmall} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 🆕 Pagination Controls */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  &lt; ก่อนหน้า
                </button>
                <span className={styles.pageInfo}>
                  หน้า {currentPage} จาก {totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  ถัดไป &gt;
                </button>
              </div>
            )}
            
            {/* 🆕 แสดงสถานะเมื่อกรองแล้วไม่พบข้อมูล */}
            {filteredEmployees.length === 0 && employees.length > 0 && (
                <div className={styles.filterEmptyState}>
                    ไม่พบพนักงานที่ตรงกับ: **{nameFilter}**
                </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {employees.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Calendar className={styles.emptyIcon} />
            </div>
            <p className={styles.emptyTextPrimary}>ยังไม่มีข้อมูลพนักงาน</p>
            <p className={styles.emptyTextSecondary}>
              เริ่มต้นโดยการเพิ่มพนักงานใหม่
            </p>
          </div>
        )}
      </div>
    </div>
  );
}