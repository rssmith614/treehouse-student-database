import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db, storage } from "../../Services/firebase";
import { Button, Card, Offcanvas, Table } from "react-bootstrap";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { ToastContext } from "../../Services/toast";


const grades = {
  'K': 'Kindergarten',
  '1': '1st Grade',
  '2': '2nd Grade',
  '3': '3rd Grade',
  '4': '4th Grade',
  '5': '5th Grade',
  '6': '6th Grade',
  '7': '7th Grade',
  '8': '8th Grade',
}

const AssessmentEdit = () => {
  const [assessment, setAssessment] = useState({});
  const [questions, setQuestions] = useState([]);

  const [assessmentFile, setAssessmentFile] = useState();

  const [show, setShow] = useState(false);

  const assessmentFileRef = useRef();

  const addToast = useContext(ToastContext);

  const params = useParams();

  useEffect(() => {
    getDoc(doc(db, 'assessments', params.assessmentid))
      .then(res => {
        setAssessment(res.data());
        setQuestions(Object.keys(res.data().questions).map(key => {
          return { ...res.data().questions[key], num: key }
        }));

        if (res.data().file === '' || !res.data().file) return;

        assessmentFileRef.current = ref(storage, res.data().file);
        getDownloadURL(assessmentFileRef.current)
          .then(url => setAssessmentFile(url));
      })

    onSnapshot(doc(db, 'assessments', params.assessmentid), res => {
      setAssessment(res.data());
      setQuestions(Object.keys(res.data().questions).map(key => {
        return { ...res.data().questions[key], num: key }
      }));
    })

  }, [params.assessmentid])

  async function handleFileSubmit(e) {
    e.preventDefault();

    document.getElementById('save-new-file').setAttribute('disabled', true);
    document.getElementById('save-new-file').innerHTML = "Submit <span class='spinner-border spinner-border-sm' />";

    let amtFile = document.getElementById('amt-file').files[0];

    if (amtFile) {
      let amtCatRef = ref(storage, `/assessments/${assessment.grade}/${assessment.category}/`);

      let res = await listAll(amtCatRef)
      let fileNameList = res.items.map(f => f.name);

      if (fileNameList.includes(amtFile.name)) {
        window.alert("Multiple versions of the same file are not supported. Please rename the new file and try again.");
        document.getElementById('save-new-file').removeAttribute('disabled');
        document.getElementById('save-new-file').innerHTML = "Submit";
        return;
      }

      setShow(true);

    } else {
      window.alert("Please select a file first");
      document.getElementById('save-new-file').removeAttribute('disabled');
      document.getElementById('save-new-file').innerHTML = "Submit";
      return;
    }

    document.getElementById('save-new-file').removeAttribute('disabled');
    document.getElementById('save-new-file').innerHTML = "Submit";
  }

  async function handleAnswerKeySubmit(e) {
    e.preventDefault();

    e.target.setAttribute('disabled', true);
    e.target.innerHTML = "Submit <span class='spinner-border spinner-border-sm' />";

    if (e.target.id === 'submit-csv') {
      window.alert("TODO: .csv answer key processing")
    } else if (e.target.id === 'submit-q-num') {
      let amtFile = document.getElementById('amt-file').files[0];
      let amtFileRef = ref(storage, `/assessments/${assessment.grade}/${assessment.category}/${amtFile.name}`);

      let numOfQuestions = parseInt(document.getElementById('q-num').value);
      let newQuestions = Object.assign({}, ...[...Array(numOfQuestions).keys()].map(x => ({ [x + 1]: { "question": "", "sample_answer": "", "standard": "" } })))

      console.log(numOfQuestions, newQuestions)

      await updateDoc(doc(db, 'assessments', params.assessmentid), { 'questions': newQuestions, 'file': amtFileRef.fullPath });
      await uploadBytes(amtFileRef, amtFile);

      addToast({ "header": "Assessment File Updated", "message": `${grades[assessment.grade]} ${assessment.category} Assessment's file has been updated, and answer key has been reset.` });
      setShow(false);
    }

    e.target.removeAttribute('disabled');
    e.target.innerHTML = "Submit";
  }

  async function handleQuestionChanges(e) {
    e.preventDefault();

    document.getElementById('save-q-changes').setAttribute('disabled', true);
    document.getElementById('save-q-changes').innerHTML = "Save Changes <span class='spinner-border spinner-border-sm' />";

    let ok = true;

    await questions.reduce(async (a, q) => {
      await a;
      if (q.standard !== '') {
        let res = await getDocs(query(collection(db, 'standards'), where('key', '==', q.standard)))
        
        if (res.docs.length === 0) {
          window.alert(`Error: Standard '${q.standard}' on question ${q.num} doesn't exist`);
          ok = false;
          console.log(ok)
          return;
        }
      }
    }, Promise.resolve());

    console.log(ok)

    if (ok) {
      let newQuestions = Object.assign({}, ...questions.map(q => ({ [q.num]: { question: q.question, sample_answer: q.sample_answer, standard: q.standard } })))

      await updateDoc(doc(db, 'assessments', params.assessmentid), { 'questions': newQuestions })

      
      addToast({ header: "Answer Key Updated", message: `Questions, Answers, and Standards for ${assessment.grade} ${assessment.category} assessment have been updated` })
    }
    
    document.getElementById('save-q-changes').removeAttribute('disabled');
    document.getElementById('save-q-changes').innerHTML = "Save Changes";
  }

  return (
    <div className="d-flex flex-column p-3">
      <div className="display-1">Edit Assessment</div>
      <h3>{grades[assessment.grade]} {assessment.category}</h3>
      <Card className="bg-light-subtle p-3">
        <div className="h5">File</div>
        <div className="p-3 mx-3 d-flex flex-column">
          <div id="current-file" className="py-3 d-flex flex-row align-items-center justify-content-between">
            <div className="h6">Current File</div>
            {assessment.file === '' || !assessment.file ?
              <div>No file</div>
              :
              <div>
                <a id="file" className="" href={assessmentFile} target="_blank" rel="noreferrer">{assessment.file}</a>
              </div>
            }
            <div>
              <Button onClick={() => {
                document.getElementById('new-file-upload').classList.remove('d-none')
                document.getElementById('current-file').classList.add('d-none')
              }}>Upload New Assessment File</Button>
            </div>
          </div>
          <div id="new-file-upload" className="d-none d-flex flex-row justify-content-between" >
            <div className="d-flex flex-column align-self-center">
              <div className="h6 me-auto">Upload New Assessment File</div>
            </div>
            <div className="d-flex flex-column py-1">
              <div>
                <input id="amt-file" type="file" className="form-control" />
              </div>
              <div className="d-flex flex-row py-3">
                <Button variant="secondary" className="ms-auto mx-3" onClick={() => {
                  document.getElementById('new-file-upload').classList.add('d-none')
                  document.getElementById('current-file').classList.remove('d-none')
                }}>Cancel</Button>
                <div className="">
                  <Button id="save-new-file" onClick={handleFileSubmit}>Submit</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="h5">Answer Key and Standards</div>
        <Table>
          <thead>
            <tr>
              {/* <th></th> */}
              <th>Question #</th>
              <th>Question</th>
              <th>Sample Answer</th>
              <th>Standard</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => {
              return (
                <tr key={i}>
                  <td className="text-center">{q.num}</td>
                  <td>
                    <textarea className="form-control" value={q.question} onChange={e => setQuestions(questions.map(item => {
                      if (item.num !== q.num) return item;
                      else return { ...item, question: e.target.value };
                    }))} />
                  </td>
                  <td>
                    <textarea className="form-control" value={q.sample_answer} onChange={e => setQuestions(questions.map(item => {
                      if (item.num !== q.num) return item;
                      else return { ...item, sample_answer: e.target.value };
                    }))} />
                  </td>
                  <td>
                    <input className="form-control" value={q.standard} onChange={e => setQuestions(questions.map(item => {
                      if (item.num !== q.num) return item;
                      else return { ...item, standard: e.target.value };
                    }))} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
        <Button id="save-q-changes" onClick={handleQuestionChanges}>Save Changes</Button>
      </Card>
      <Offcanvas show={show} onHide={() => setShow(false)} placement="end">
        <Offcanvas.Header>
          <Offcanvas.Title>New Assessment File for {grades[assessment.grade]} {assessment.category}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-row">
            <Button className="mx-3" onClick={() => {
              document.getElementById('manual-entry').classList.remove('d-none')
              document.getElementById('csv-upload').classList.add('d-none')
            }}>Enter Answer Key Manually</Button>
            <Button className="mx-3" onClick={() => {
              document.getElementById('csv-upload').classList.remove('d-none')
              document.getElementById('manual-entry').classList.add('d-none')
            }}>Upload .csv of Answer Key</Button>
          </div>
          <div id="manual-entry" className="d-flex flex-column pt-5 d-none">
            <div className="flex-row justify-content-between">
              <div className="h6">Enter number of questions:</div>
              <input id='q-num' type="number" min={1} defaultValue={1} className="form-control" />
            </div>
            <div className="pt-3">Type Questions, Answers, and Standards on the Edit Screen after submitting</div>
            <Button id="submit-q-num" className="ms-auto" onClick={handleAnswerKeySubmit}>Submit</Button>
          </div>
          <div id="csv-upload" className="d-flex flex-column pt-5 d-none">
            {/* <div className="d-flex flex-row justify-content-between"> */}
            <div className="h6">Upload .csv file with Questions, Answers, and Standards</div>
            <input type="file" className="form-control" />
            {/* </div> */}
            <div className="d-flex flex-row pt-3">
              <Button id="submit-csv" className="ms-auto" onClick={handleAnswerKeySubmit}>Submit</Button>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )
}

export default AssessmentEdit;