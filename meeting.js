window.onload = async () => {  

  Wized.data.listen("v.render_all_meetings", async () => {  
    const meetings = await Wized.data.get("r.8.d")
    console.log(meetings);
    const admin = await Wized.data.get("r.4.d")
    const filteredMeetings = meetings.filter(i => i.committees_id === admin.id).sort((b,a)=>a.meeting_date>b.meeting_date ? 1 : -1);
    console.log(filteredMeetings);

    let meetingArrReversed = filteredMeetings.reverse();
    let meetingYearOne = meetingArrReversed.slice(0,12);
    let meetingYearTwo = meetingArrReversed.slice(12,24);
    let meetingYearThree = meetingArrReversed.slice(24,36);
    let attendance = [];
    let months = [];

    for (let i in filteredMeetings) {
      months.push(new Date(meetingArrReversed[i].meeting_date).toLocaleString('default', { month: 'short' }));
      attendance.push(meetingArrReversed[i]._attendance.length)
    }

    Chart.defaults.color = '#c0c0c0';
    Chart.defaults.borderColor = '#ebedf0';

    const ctxBar = document.getElementById('barChart');

    const noData = {
      id: 'noData',
      afterDatasetsDraw: ((chart, args, plugins) => {
        const { ctx, data, chartArea: {top, bottom, left, right, width, height} } = chart;

        ctx.save();

        if (data.datasets[0].data.length === 0) {
          ctx.fillStyle = 'rgba(255,255,255,1)';
          ctx.fillRect(230,75,500,125);
          ctx.font = '600 16px Open Sans';
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.fillText('Create a meeting to view your attendance analytics', left + width / 2, top + height / 2)
        }
      })
    };

    const barChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Member Count',
          data: attendance,
          borderWidth: 2,
          borderColor: "rgb(123,180,227)",
          barPercentage: 0.6,
          //borderRadius: 6,
          backgroundColor: 'rgb(123,180,227, 0.5)',
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
            position: 'top',
            align: 'end',
          },
          title: {
            display: false,
          },
          tooltip: {
            enabled: true,
            position: 'nearest',
          }
        },
        scales: {
          y: {
            //stacked: true,
            grid: {
              display: true,
              lineWidth: 2,
            },
            border: {
              dash: [4,8],
              width: 2,
            },
            ticks: {
              display: true,
            }
          },
          x: {
            //stacked: true,
            grid: {
              display: false,
              lineWidth: 2,
            },
            border: {
              width: 2,
            },
          }
        },
        maintainAspectRatio: false,
        tension: 0.4,
        responsive: true,
        fill: true,
      },
      plugins: [noData],
    });


    function getObjectWithMaxValue(arr) {
      if (arr.length === 0) {
        return null;
      }
      let maxValue = -Infinity;
      let maxObject = null;
      for (let i = 0; i < arr.length; i++) {
        const currentObject = arr[i];
        const currentValue = currentObject._attendance.length;
        if (currentValue > maxValue) {
          maxValue = currentValue;
          maxObject = currentObject;
        }
      }
      return maxObject;
    }

    let attendanceAverage = array => array.reduce((a, b) => a + b) / array.length;
    document.getElementById("attendanceAverage").innerHTML = Math.round(attendanceAverage(attendance))
    document.getElementById("attendanceHigh").innerHTML = Math.max(...attendance)
    document.getElementById("attendanceLow").innerHTML = Math.min(...attendance)
    let highestAttendanceObj = getObjectWithMaxValue(meetingArrReversed);
    let highestAttendanceMonth = new Date(highestAttendanceObj.meeting_date).toLocaleString('default', { month: 'long' })
    document.getElementById("highestMonth").innerHTML = highestAttendanceMonth

    if (filteredMeetings.length <= 12) {
      document.getElementById("allYears").insertAdjacentHTML("afterend", `<option value='${attendance.slice(0,12)}' id='yearOne'>All Years</option>`);
    } else if (filteredMeetings.length > 12 && filteredMeetings.length <= 24) {
      document.getElementById("allYears").insertAdjacentHTML("afterend", `<option value='${attendance.slice(12,24)}' id='yearTwo'>${new Date(meetingYearTwo[0].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})} - ${new Date(meetingYearTwo[meetingYearTwo.length-1].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})}</option>`);
      document.getElementById("allYears").insertAdjacentHTML("afterend", `<option value='${attendance.slice(0,12)}' id='yearOne'>${new Date(meetingYearOne[0].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})} - ${new Date(meetingYearOne[meetingYearOne.length-1].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})}</option>`);
    } else if (filteredMeetings.length > 24 && filteredMeetings.length <= 36) {
      document.getElementById("allYears").insertAdjacentHTML("afterend", `<option value='${attendance.slice(24,36)}' id='yearThree'>${new Date(meetingYearThree[0].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})} - ${new Date(meetingYearThree[meetingYearThree.length-1].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})}</option>`);
      document.getElementById("allYears").insertAdjacentHTML("afterend", `<option value='${attendance.slice(12,24)}' id='yearTwo'>${new Date(meetingYearTwo[0].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})} - ${new Date(meetingYearTwo[meetingYearTwo.length-1].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})}</option>`);
      document.getElementById("allYears").insertAdjacentHTML("afterend", `<option value='${attendance.slice(0,12)}' id='yearOne'>${new Date(meetingYearOne[0].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})} - ${new Date(meetingYearOne[meetingYearOne.length-1].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})}</option>`);
    }

    const attendanceFilters = document.getElementById('attendanceFilters');
    attendanceFilters.addEventListener('change', updateAttendance);

    function updateAttendance(){
      document.getElementById("allYears").value = attendance
      barChart.data.datasets[0].data = attendanceFilters.value.split(",");
      let selectText = $("#attendanceFilters option:selected").text();
      let filterLabels = [];
      if (selectText === "Sort by date") {
        filterLabels = months;
        highestAttendanceObj = getObjectWithMaxValue(meetingArrReversed);
        document.getElementById("attendanceAverage").innerHTML = Math.round(attendanceAverage(attendance))
        document.getElementById("attendanceHigh").innerHTML = Math.max(...attendance)
        document.getElementById("attendanceLow").innerHTML = Math.min(...attendance)
      } else if (selectText === `${new Date(meetingYearOne[0].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})} - ${new Date(meetingYearOne[meetingYearOne.length-1].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})}`) {
        filterLabels = months.slice(0,12);
        highestAttendanceObj = getObjectWithMaxValue(meetingYearOne);
        document.getElementById("attendanceAverage").innerHTML = Math.round(attendanceAverage(attendance.slice(0,12)))
        document.getElementById("attendanceHigh").innerHTML = Math.max(...attendance.slice(0,12))
        document.getElementById("attendanceLow").innerHTML = Math.min(...attendance.slice(0,12))
      } else if (selectText === `${new Date(meetingYearTwo[0].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})} - ${new Date(meetingYearTwo[meetingYearTwo.length-1].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})}`) {
        filterLabels = months.slice(12,24);
        highestAttendanceObj = getObjectWithMaxValue(meetingYearTwo);
        document.getElementById("attendanceAverage").innerHTML = Math.round(attendanceAverage(attendance.slice(12,24)))
        document.getElementById("attendanceHigh").innerHTML = Math.max(...attendance.slice(12,24))
        document.getElementById("attendanceLow").innerHTML = Math.min(...attendance.slice(12,24))
      }
      else if (selectText === `${new Date(meetingYearThree[0].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})} - ${new Date(meetingYearThree[meetingYearThree.length-1].meeting_date).toLocaleString('default', { month: 'short', year: "numeric",})}`) {
        filterLabels = months.slice(24,36);
        highestAttendanceObj = getObjectWithMaxValue(meetingYearThree);
        document.getElementById("attendanceAverage").innerHTML = Math.round(attendanceAverage(attendance.slice(24,36)))
        document.getElementById("attendanceHigh").innerHTML = Math.max(...attendance.slice(24,36))
        document.getElementById("attendanceLow").innerHTML = Math.min(...attendance.slice(24,36))
      }
      let highestAttendanceMonth = new Date(highestAttendanceObj.meeting_date).toLocaleString('default', { month: 'long' })
      document.getElementById("highestMonth").innerHTML = highestAttendanceMonth
      barChart.data.labels = filterLabels;
      barChart.update();
    }

  });
}
