import Table from 'react-bootstrap/Table'
import 'bootstrap/dist/css/bootstrap.min.css';


function TableRow(props) {
  console.log(props.rowdata["name"]);
  return (
      <tr>
        <td>{props.rowdata["name"]}</td>
        <td>Mark</td>
        <td>Otto</td>
        <td>@mdo</td>
      </tr>
        
  );
}

export default TableRow;