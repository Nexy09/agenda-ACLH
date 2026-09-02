const fs = require('fs');
let content = fs.readFileSync('src/components/CalendarWidget.tsx', 'utf8');

const missingFunctions = `
  const handleDeleteEvent = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventClick = (arg: any) => {
    const eventObj = events.find(e => e.id === arg.event.id);
    if (eventObj) {
      setSelectedEvent(eventObj);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    const ev = events.find(e => e.id === id);
    if (ev) {
      await updateDoc(doc(db, "events", id), {
        extendedProps: { ...ev.extendedProps, notes }
      });
      setSelectedEvent({ ...ev, extendedProps: { ...ev.extendedProps, notes } });
    }
  };

  const handleEditClick = (eventData: any) => {
    setEventToEdit(eventData);
    setIsModalOpen(true);
    setSelectedEvent(null);
  };
`;

content = content.replace('        };', missingFunctions + '        };');
fs.writeFileSync('src/components/CalendarWidget.tsx', content);
