import React, { useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../../db';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, CardContent, Card, CardMedia
} from '@mui/material';
import { Autorenew, PictureAsPdf, TaskAlt } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Send as SendIcon } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const List = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const networkStatus = useSelector((state) => state.networkStatus);

  const componentRef = useRef();

  const { pid } = useParams();

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {

  }, {});

  const onPageChange = (
    event, page
  ) => {
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get(process.env.REACT_APP_PATH + '/desaparecido/' + pid).then((result) => {
          console.log(JSON.stringify(result));
          if (result.distrito) {
            let distrito = result.distrito;
            if (distrito.provincia) {
              let provincia = distrito.provincia;
              result.provincia = provincia.id;
              if (provincia.departamento) {
                result.departamento = provincia.departamento.id;
              }
            }
          }
          result.idPersona = result.persona.id;
          result.regPolicial = result.dependencia.name + ' - ' + result.dependencia.descripcion;
          result.distrito = result.distrito.id;
          result.nombres = result.persona.nombres;
          result.apePaterno = result.persona.apePaterno;
          result.apeMaterno = result.persona.apeMaterno;
          result.dni = result.persona.dni;
          result.estadoCivil = result.persona.estadoCivil;
          result.sexo = result.persona.sexo;
          result.edad = result.persona.edad;
          result.fechaNacimiento = result.persona.fechaNacimiento;
          result.direccion = result.persona.direccion;
          result.foto = result.persona.foto;
          set(result);
        });
      }
    }
  }, [pid]);

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get(process.env.REACT_APP_PATH + '/desaparecido/' + page + '/' + state.rowsPerPage);
      data.size = result.size;
      data.data = data.data.concat(result.content);
    }
    setResult(data);
  };

  const { height, width } = useResize(React);

  useEffect(() => {
    const header = document.querySelector('.MuiToolbar-root');
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    const nav = document.querySelector('nav');
    const toolbarTable = document.querySelector('.Toolbar-table');
    const tablePagination = document.querySelector('.MuiTablePagination-root');

    if (tableContainer) {
      tableContainer.style.width = (width - nav.offsetWidth) + 'px';
      tableContainer.style.height = (height - header.offsetHeight
        - toolbarTable.offsetHeight - tablePagination.offsetHeight) + 'px';
    }
  }, [height, width]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Ver Alerta de Persona Desaparecido.' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const onClickPrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Alerta',
    onAfterPrint: () => dispatch({ type: "snack", msg: 'Alerta de Persona desaparecida impreso.!' }),
  });

  function fechaHora(timestamp) {
    const fecha = new Date(timestamp);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    let hora = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const segundos = fecha.getSeconds().toString().padStart(2, '0');
    const amPm = hora >= 12 ? 'PM' : 'AM';
    hora = hora % 12;
    hora = hora ? hora : 12;
    return `${dia}/${mes}/${anio}  ${hora}:${minutos}:${segundos} ${amPm}`;
  }

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Card>
        <CardContent>
          <Toolbar className="Toolbar-table" direction="row" >
            <Grid container spacing={2}>
              <Grid item xs={12} md={10}>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button sx={{ width: '100%', fontWeight: 'bold' }} variant="contained" onClick={onClickPrint} color="primary" startIcon={<SendIcon />}>
                  Imprimir
                </Button>
              </Grid>
            </Grid>
          </Toolbar>
          <Card ref={componentRef} sx={{ minWidth: 275 }} className='mt-4'>
            <CardContent>
              <Typography gutterBottom component="div" fontSize={'25px'} className='text-center fw-bold pt-2 mb-0' sx={{ textTransform: 'uppercase', color: 'red' }}>
                NOTA DE ALERTA
              </Typography>
              <Typography gutterBottom component="div" fontSize={'20px'} className='text-center fw-bold' sx={{ textTransform: 'uppercase' }}>
                POLICIA NACIONAL DEL PERÚ
              </Typography>
              <Grid container>
                <Grid item xs={12} sm={12} md={12} className='p-3' sx={{ backgroundColor: '#a8a8a8' }}>
                  <Typography gutterBottom component="div" fontSize={'20px'} className='text-center fw-bold' sx={{ textTransform: 'uppercase' }}>
                    DATOS DE LA DEPENDENCIA Y DENUNCIA POLICIAL
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    DEPENDENCIA POLICIAL :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.regPolicial}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    Nº DE LA DENUNCIA :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.nroDenuncia}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    FECHA :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {fechaHora(o.fechaHoraDenuncia)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} className='p-3' sx={{ backgroundColor: '#a8a8a8' }}>
                  <Typography gutterBottom component="div" fontSize={'20px'} className='text-center fw-bold' sx={{ textTransform: 'uppercase' }}>
                    DATOS DE LA PERSONA DESAPARECIDA
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={4} className='mt-4' sx={{ paddingLeft: '1rem', marginTop: '5px' }}>
                  <img alt="Foto" height={'200px'} width={'150px'} margin={'auto'} src={o.foto ? 'data:image/png;base64, ' + o.foto : (process.env.PUBLIC_URL + "/male-female.jpg")} />
                </Grid>
                <Grid item xs={12} sm={12} md={8} sx={{ paddingLeft: '1rem', marginTop: '15px' }}>
                  <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                      APELLIDOS :
                    </Typography>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                      {o.apePaterno} {o.apeMaterno}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                      NOMBRES :
                    </Typography>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                      {o.nombres}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                      EDAD :
                    </Typography>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                      {o.edad}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                      FECHA DE NACIMIENTO :
                    </Typography>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                      {o.fechaNacimiento}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                      FECHA DE HECHO :
                    </Typography>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                      {fechaHora(o.fechaHoraHecho)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                      LUGAR DE HECHO :
                    </Typography>
                    <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                      {o.lugarHecho}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid item xs={12} className='mt-3'>
                  <Divider variant="middle" />
                </Grid>

                <Grid item xs={12} sm={12} md={12} className='mt-3' sx={{ paddingLeft: '1rem' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    CARACTERÍSTICAS :
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    TEZ :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.tez}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    FENOTIPO :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.fenotipo}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    OJOS :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.ojos}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    SANGRE :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.sangre}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    BOCA :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.boca}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    NARIZ :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.nariz}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    CABELLO :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.cabello}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    ESTATURA :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.estatura}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ paddingLeft: '1rem', display: 'flex' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    CONTEXTURA :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.contextura}
                  </Typography>
                </Grid>

                <Grid item xs={12} className='mt-3'>
                  <Divider variant="middle" />
                </Grid>

                <Grid item xs={12} sm={12} md={12} className='mt-5' sx={{ paddingLeft: '1rem' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold mb-0w' sx={{ textTransform: 'uppercase' }}>
                    SEÑAS PARTICULARES :
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={3} sx={{ paddingLeft: '1rem', textAlign: 'left' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    VESTIMENTA :
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={9} sx={{ paddingLeft: '1rem', textAlign: 'left' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.vestimenta}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={3} sx={{ paddingLeft: '1rem', textAlign: 'left' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    CIRCUNSTANCIAS :
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={9} sx={{ paddingLeft: '1rem', textAlign: 'left' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.circunstancia}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={3} sx={{ paddingLeft: '1rem', textAlign: 'left' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    OTRAS OBSERVACIONES :
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={9} sx={{ paddingLeft: '1rem', textAlign: 'left' }}>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.observacion}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12} className='p-3' sx={{ backgroundColor: '#a8a8a8' }}>
                  <Typography gutterBottom component="div" fontSize={'20px'} className='text-center fw-bold' sx={{ textTransform: 'uppercase' }}>
                    INFORMACIÓN ADICIONAL
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={12} md={12} sx={{ paddingLeft: '1rem', display: 'flex' }} className='mt-2'>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase' }}>
                    INSTRUCTOR POLICIAL :
                  </Typography>
                  <Typography gutterBottom component="div" fontSize={'16px'} className='fw-bold' sx={{ textTransform: 'uppercase', color: '#0f62ac' }}>
                    {o.observacion}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  );

};

export default List;