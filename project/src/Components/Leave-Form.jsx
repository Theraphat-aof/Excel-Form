import React, { useState, useEffect } from "react";
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
  // 🆕 สถานะใหม่: ใช้เก็บ id ของพนักงานที่กำลังอยู่ในโหมดแก้ไขชื่อ
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

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

  // 🆕 ฟังก์ชันใหม่: สำหรับเริ่มและบันทึกการแก้ไขชื่อ
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

  // 🆕 ฟังก์ชันใหม่: สำหรับจัดการการกด Enter เพื่อบันทึก
  const handleKeyPress = (e, id, newName) => {
    if (e.key === "Enter") {
      handleNameEdit(id, newName);
      e.target.blur(); // ทำให้ input หลุด focus
    }
    if (e.key === "Escape") {
      setEditingEmployeeId(null); // ยกเลิกการแก้ไข
      // อาจจะต้องค้นหาพนักงานเพื่อรีเซ็ตค่าใน input หากมีการพิมพ์ไปแล้ว
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
    const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

    // Get current employee data
    const currentEmp = employees.find((e) => e.id === selectedEmployee?.id);

    // Placeholder for empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.dayEmpty}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const leaveType = getLeaveTypeForDate(day);

      const dayClasses = [
        styles.dayCell,
        leaveType ? getLeaveTypeColor(leaveType) : styles.dayCellDefault,
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
            }`}
          >
            {day}
          </div>
          {leaveType && (
            <div className={styles.dayLeaveLabel}>
              {getLeaveTypeLabel(leaveType)}
            </div>
          )}
        </div>
      );
    }

    // Determine remaining leave color class
    const remaining = calculateRemaining(currentEmp || { remainingLeave: 0 });
    const remainingColorClass =
      remaining < 0
        ? styles.summaryRemainingNegative
        : remaining <= 2
        ? styles.summaryRemainingWarning
        : styles.summaryRemainingPositive;

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
            <div className={styles.typeSelectorContainer}>
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
              <p className={styles.typeSelectorTip}>
                💡 เคล็ดลับ: คลิกวันที่มีการลาอยู่แล้วเพื่อลบข้อมูลออก
              </p>
            </div>

            {/* Calendar Grid */}
            <div className={styles.calendarGrid}>
              {dayNames.map((day) => (
                <div key={day} className={styles.dayNameHeader}>
                  {day}
                </div>
              ))}
              {days}
            </div>
          </div>
          {/* Summary */}
          <div className={styles.summaryContainer}>
            <h4 className={styles.summaryTitle}>📊 สรุปการลาทั้งหมด</h4>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>ลาพักร้อน</div>
                <div
                  className={`${styles.summaryItemValue} ${styles.summaryVacation}`}
                >
                  {currentEmp?.vacation || 0} วัน
                </div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>ลากิจ</div>
                <div
                  className={`${styles.summaryItemValue} ${styles.summaryPersonal}`}
                >
                  {currentEmp?.personal || 0} วัน
                </div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>ลาป่วย</div>
                <div
                  className={`${styles.summaryItemValue} ${styles.summarySick}`}
                >
                  {currentEmp?.sick || 0} วัน
                </div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>ขาดงาน</div>
                <div
                  className={`${styles.summaryItemValue} ${styles.summaryAbsent}`}
                >
                  {currentEmp?.absent || 0} วัน
                </div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>วันลาคงเหลือ</div>
                <div
                  className={`${styles.summaryItemValue} ${remainingColorClass}`}
                >
                  {remaining} วัน
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

          {/* Add Employee Form */}
          <div className={styles.addEmployeeForm}>
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
                  {employees.map((emp, index) => {
                    const remaining = calculateRemaining(emp);
                    const remainingClass =
                      remaining < 0
                        ? styles.remainingNegative
                        : remaining <= 2
                        ? styles.remainingWarning
                        : styles.remainingPositive;

                    // 🆕 ตรวจสอบว่าพนักงานคนนี้กำลังถูกแก้ไขชื่ออยู่หรือไม่
                    const isEditing = editingEmployeeId === emp.id;

                    return (
                      <tr
                        key={emp.id}
                        className={
                          index % 2 === 0 ? styles.trEven : styles.trOdd
                        }
                      >
                        <td className={styles.td}>
                          {/* 🆕 ส่วนการแสดง/แก้ไขชื่อพนักงาน */}
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
                              onClick={() => setEditingEmployeeId(emp.id)} // 🆕 เมื่อคลิกจะเข้าสู่โหมดแก้ไข
                              title="คลิกเพื่อแก้ไขชื่อ"
                            >
                              {emp.name}
                            </span>
                          )}
                          {/* 🆕 สิ้นสุดส่วนการแสดง/แก้ไขชื่อพนักงาน */}
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
