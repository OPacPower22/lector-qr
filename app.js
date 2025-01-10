document.addEventListener("DOMContentLoaded", () => {
    const attendanceTable = document.getElementById("attendanceTable").querySelector("tbody");
    const generateReportBtn = document.getElementById("generateReport");
    const printReportBtn = document.getElementById("printReport");
    const stopReaderBtn = document.getElementById("stopReader");
  
    const attendanceData = [];
  
    // Configurar el lector de QR
    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  
    function startQrReader() {
      html5QrCode.start(
        { facingMode: "environment" }, // Usa la cámara trasera
        config,
        (decodedText) => handleDecodedText(decodedText),
        (errorMessage) => console.warn(errorMessage)
      );
    }
  
    function stopQrReader() {
      html5QrCode.stop().then(() => {
        console.log("Lector detenido");
      });
    }
  
    function handleDecodedText(decodedText) {
      const parsedData = parseQrData(decodedText);
      if (parsedData) {
        addToAttendance(parsedData);
      }
    }
  
    function parseQrData(data) {
      try {
        const lines = data.split("\n");
        const name = lines[0].split(": ")[1];
        const grade = lines[1]?.split(": ")[1] || "N/A";
        const type = lines[2]?.split(": ")[1] || "Usuario";
  
        return { name, grade, type, date: new Date() };
      } catch (error) {
        console.error("Error al analizar el QR:", error);
        return null;
      }
    }
  
    function addToAttendance({ name, grade, type, date }) {
      const row = attendanceTable.insertRow();
      row.insertCell(0).innerText = name;
      row.insertCell(1).innerText = grade;
      row.insertCell(2).innerText = type;
      row.insertCell(3).innerText = date.toLocaleString();
  
      attendanceData.push({ name, grade, type, date });
      updateStatistics();
    }
  
    function generateReport() {
      const reportWindow = window.open("", "Reporte", "width=800,height=600");
      const tableHtml = attendanceTable.parentElement.outerHTML;
      reportWindow.document.write(`<html><head><title>Reporte</title></head><body>${tableHtml}</body></html>`);
      reportWindow.document.close();
    }
  
    function printReport() {
      generateReport();
      setTimeout(() => window.print(), 500);
    }
  
    function updateStatistics() {
      const grades = attendanceData.reduce((acc, { grade }) => {
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {});
  
      const ctx = document.getElementById("attendanceChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(grades),
          datasets: [
            {
              label: "Asistencia por Grado",
              data: Object.values(grades),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        },
      });
    }
  
    generateReportBtn.addEventListener("click", generateReport);
    printReportBtn.addEventListener("click", printReport);
    stopReaderBtn.addEventListener("click", stopQrReader);
  
    startQrReader();
  });
  