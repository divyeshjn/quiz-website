export const downloadCSVTemplate = () => {
  const csvContent = [
    "questionText,optionA,optionB,optionC,optionD,correctOption",
    "Which data structure follows FIFO?,Stack,Queue,Tree,Graph,B",
    "Which scheduling algorithm uses a time quantum?,FCFS,Round Robin,SJF,Priority Scheduling,B",
  ].join("\r\n");

  const blob = new Blob(
    ["\uFEFF", csvContent],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "quiz_questions_template.csv";

  document.body.appendChild(link);

  link.click();

  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};