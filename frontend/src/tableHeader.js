import Table from 'react-bootstrap/Table'
import 'bootstrap/dist/css/bootstrap.min.css';


function TableHeader() {
  return (
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>      
  );
}

export default TableHeader;