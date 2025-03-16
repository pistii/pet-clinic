import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

let calendarEl = document.getElementById('calendar');
let calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek'
  },
  //Click event: https://fullcalendar.io/docs/eventClick
  eventClick: function(info) {
    console.log(info);
    alert('Event: ' + info.event.title);
    alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
    alert('View: ' + info.view.type);
    // change the border color just for fun
    info.el.style.borderColor = 'red';
  },
  events: [
    {
      title: 'Meeting',
      start: '2025-03-16T14:30:00',
      end: '2025-03-16T14:45:00',
      extendedProps: {
        status: 'done'
      }
    },
    {
      title: 'Birthday Party',
      start: '2025-03-17T07:00:00',
      backgroundColor: 'green',
      borderColor: 'green'
    }
  ],
});
calendar.render();