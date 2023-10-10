import { useEffect, useState } from "react";


const EmergencyContactList = (params) => {
  const [listForm, setListForm] = useState([]);

  useEffect(() => {
  
    function updateEContacts() {
      let newList = params.list.map((e) => {return e});
      newList.forEach((eContact, i) => {
        eContact.name = document.getElementById(`contact${i}name`).value;
        eContact.relation = document.getElementById(`contact${i}rel`).value;
        eContact.phone = document.getElementById(`contact${i}phone`).value;
      })
  
      params.setList(newList);
    }

    function removeEContact(idx) {
      let newList = params.list.map((e) => {return e});
      
      newList.forEach((eContact, i) => {
        document.getElementById(`contact${i}name`).value = "";
        document.getElementById(`contact${i}rel`).value = "";
        document.getElementById(`contact${i}phone`).value = "";
      });
      
      newList.splice(idx, 1);

      newList.forEach((eContact, i) => {
        document.getElementById(`contact${i}name`).value = eContact.name;
        document.getElementById(`contact${i}rel`).value = eContact.relation;
        document.getElementById(`contact${i}phone`).value = eContact.phone;
      });

      params.setList(newList);
    }
  
    if (!params.list) setListForm(null);
    else {
      setListForm(
        params.list.map((contact, i) => {
        let rowid = "contact" + i;
        return (
          <div className="d-flex flex-row m-1" key={i}>
            <div className="m-2 d-flex flex-column align-items-center">
              <button id={rowid + 'del'} type="button"
                onClick={() => {removeEContact(params.list.indexOf(contact))} }
                class="form-control btn btn-danger flex-fill">🗑️</button>
            </div>
            <div className="m-2">
              <label for={rowid + 'name'} class="form-label">Name</label>
              <input type="text" class="form-control" id={rowid + 'name'}
                defaultValue={contact.name} onBlur={updateEContacts} />
            </div>
            <div className="m-2">
              <label for={rowid + 'rel'} class="form-label">Relation</label>
              <input type="text" class="form-control" id={rowid + 'rel'}
                defaultValue={contact.relation} onBlur={updateEContacts} />
            </div>
            <div className="m-2">
              <label for={rowid + 'phone'} class="form-label">Phone</label>
              <input type="tel" class="form-control" id={rowid + 'phone'}
                defaultValue={contact.phone} onBlur={updateEContacts} />
            </div>
          </div>
        );
      }))
    }

    // params.list.forEach((eContact, i) => {
    //   console.log(eContact, i);
    //   document.getElementById(`contact${i}name`).value = eContact.name;
    //   document.getElementById(`contact${i}rel`).value = eContact.relation;
    //   document.getElementById(`contact${i}phone`).value = eContact.phone;
    // });
    
  }, [params, params.list]);
  
  return listForm;
}

export default EmergencyContactList;