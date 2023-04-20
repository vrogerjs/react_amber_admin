import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { db } from '../../db';
import {
  Send as SendIcon,
  Add as AddIcon,
  Keyboard
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box, Button, Card, CardContent, Fab, MenuItem, Stack, InputAdornment, TextField, Grid, Typography
} from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Select from '@mui/material/Select';

import { retrieve } from '../../db';

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Divider from '@mui/material/Divider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { makeStyles } from '@material-ui/core/styles';
import MapWrapper from '../../components/MapWrapper'

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [dependencias, setDependencias] = useState([]);

  const [departamentos, setDepartamentos] = useState([]);

  const [provincias, setProvincias] = useState([]);

  const [distritos, setDistritos] = useState([]);

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {
    departamento: '00',
    latitud: '',
    longitud: ''
  }, {});

  const [d] = useFormState(useState, {

  }, {});

  let days = { 2: 'Lunes', 3: 'Martes', 4: 'Miercoles', 5: 'Jueves', 6: 'Viernes' };

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Actualizar' : 'Registrar') + ' Dependencia' });
    [].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });

    retrieve('region', setDepartamentos);
    retrieve('province', setProvincias);
    retrieve('district', setDistritos);

  }, []);

  const pad = (num, places) => String(num).padStart(places, '0')

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
          result.dependencia = result.dependencia.id;
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
          console.log(JSON.stringify(result));
          set(result);
        });
      }
    }
  }, [pid]);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - header.offsetHeight - toolBar.offsetHeight) + 'px';
      toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Gestión de Persona Desaparecida.' });
    fetchData()
  }, []);

  const fetchData = async () => {
    if (networkStatus.connected) {
      const result = await (http.get(process.env.REACT_APP_PATH + '/dependencia'));
      setDependencias(result);
    }
  };

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickAdd = async () => {
    navigate('/desaparecido/create', { replace: true });
  }

  const onClickSave = async () => {
    const form = formRef.current;
    if (0 || form != null && validate(form)) {
      if (!o.idPersona) {
        var o3 = { nombres: o.nombres, apePaterno: o.apePaterno, apeMaterno: o.apeMaterno, dni: o.dni, direccion: o.direccion, fechaNacimiento: o.fechaNacimiento, edad: o.edad, sexo: o.sexo, estadoCivil: o.estadoCivil, foto: o.foto };
        let resultP = await http.post(process.env.REACT_APP_PATH + '/persona', o3);
        set(o => ({ ...o, idPersona: resultP.id }));
        o.idPersona = resultP.id;
      }
      if (o.idPersona) {
        console.log(o);
        var o2 = { ...o, dependencia: { id: o.dependencia }, distrito: { id: o.distrito }, persona: { id: o.idPersona }, estado: 0 };
        http.post(process.env.REACT_APP_PATH + '/desaparecido', o2).then(async (result) => {
          if (!o2._id) {
            if (result.id) {
              // navigate('/desaparecido/' + result.id + '/edit', { replace: true });
              dispatch({ type: "snack", msg: 'Registro grabado!' });
              navigate('/desaparecido', { replace: true });
            }
            else {
              navigate(-1);
            }
          }
        });
      }
    } else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }
  };

  const onSubmit = data => console.log(data);

  const theme = createTheme({
    components: {
      // Name of the component ⚛️
      MuiInput: {
        defaultProps: {
          required: true
        }
      },
    },
  });

  function onChangeFechaHoraDenuncia(v) {
    o.fechaHoraDenuncia = v;
    set(o => ({ ...o, fechaHoraDenuncia: v }));
  }

  function onChangeFechaHoraHecho(v) {
    o.fechaHoraHecho = v;
    set(o => ({ ...o, fechaHoraHecho: v }));
  }

  function onChangeFechaNacimiento(v) {
    set(o => ({ ...o, fechaNacimiento: v }), () => {
      o.fechaNacimiento = v;
    });
  }

  function disabled() {
    if (o.varTemp === 1) {
      return true;
    } else {
      return false;
    };
  }

  const onKeyUpNroDocumento = async () => {
    if (o.dni.length === 8) {
      http.get(process.env.REACT_APP_PATH + '/persona/search/' + o.dni).then(async (resultP) => {
        if (resultP.length > 0) {

          var idPersona = resultP[0].id;
          var nombres = resultP[0].nombres;
          var apePaterno = resultP[0].apePaterno;
          var apeMaterno = resultP[0].apeMaterno;
          var direccion = resultP[0].direccion;
          var fechaNacimiento = resultP[0].fechaNacimiento;
          var edad = resultP[0].edad;
          var sexo = resultP[0].sexo;
          var estadoCivil = resultP[0].estadoCivil;
          var foto = resultP[0].foto;

          console.log('idPersona > 0', idPersona);

          set(o => ({ ...o, nombres: nombres, apePaterno: apePaterno, apeMaterno: apeMaterno, direccion: direccion, idPersona: idPersona, fechaNacimiento: fechaNacimiento, edad: edad, sexo: sexo, estadoCivil: estadoCivil, foto: foto, varTemp: 1 }), () => {
            o.idPersona = idPersona;
            o.nombres = nombres;
            o.apePaterno = apePaterno;
            o.apeMaterno = apeMaterno;
            o.direccion = direccion;
            o.fechaNacimiento = fechaNacimiento;
            o.edad = edad;
            o.sexo = sexo;
            o.estadoCivil = estadoCivil;
            o.foto = foto;
            o.varTemp = 1;
          });
        } else {
          http.get('http://web.regionancash.gob.pe/api/reniec/Consultar?nuDniConsulta=' + o.dni + '&out=json', (h) => {
            return { "Content-Type": "*/*" };
          }).then(async (result) => {
            if (result.consultarResponse.return.coResultado === '0000') {
              var datos = result.consultarResponse.return;
              var nombres = datos.datosPersona.prenombres;
              var apePaterno = datos.datosPersona.apPrimer;
              var apeMaterno = datos.datosPersona.apSegundo;
              var direccion = datos.datosPersona.direccion;
              var foto = datos.datosPersona.foto;

              set(o => ({ ...o, nombres: nombres, apePaterno: apePaterno, apeMaterno: apeMaterno, direccion: direccion, foto: foto, idPersona: '', varTemp: 2 }), () => {
                o.nombres = nombres;
                o.apePaterno = apePaterno;
                o.apeMaterno = apeMaterno;
                o.direccion = direccion;
                o.foto = foto;
                o.idPersona = '';
                o.varTemp = 2;
              });
              console.log('idPersona no lo encuentra', idPersona);

            } else {
              set(o => ({ ...o, nombres: '', apePaterno: '', apeMaterno: '', direccion: '', fechaNacimiento: '', edad: '', sexo: 'Masculino', estadoCivil: 'Soltero(a)' }), () => {
                o.nombres = '';
                o.apePaterno = '';
                o.apeMaterno = '';
                o.direccion = '';
                o.fechaNacimiento = '';
                o.edad = '';
                o.sexo = 'Masculino';
                o.estadoCivil = 'Soltero(a)';
              });
            }
          });
        }
      });
    } else {
      set(o => ({ ...o, nombres: '', apePaterno: '', apeMaterno: '', direccion: '', fechaNacimiento: '', edad: '', sexo: 'Masculino', estadoCivil: 'Soltero(a)', foto: '' }), () => {
        o.nombres = '';
        o.apePaterno = '';
        o.apeMaterno = '';
        o.direccion = '';
        o.fechaNacimiento = '';
        o.edad = '';
        o.sexo = 'Masculino';
        o.estadoCivil = 'Soltero(a)';
        o.foto = '';
      });
    }
  }

  function getActions() {
    return <>
      <Button variant="contained" onClick={onClickCancel} color="error">
        Cancelar
      </Button>
      <Button disabled={o.old && !o.confirm} variant="contained" onClick={onClickSave} color="success" endIcon={<SendIcon />}>
        Grabar
      </Button>
    </>
  }

  function getContent() {

    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>
          <Card className='mt-1 bs-black'>
            <CardContent>
              <Typography gutterBottom variant="h5" className='text-center fw-bold color-gore'>
                DATOS DEL DESAPARECIDO
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Nro Denuncia: "
                    placeholder="Ingrese el número de Denuncia."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("nroDenuncia")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <DateTimePicker
                    renderInput={(props) => <TextField {...props} />}
                    required
                    label="Fecha y Hora de la Denuncia:"
                    value={o.fechaHoraDenuncia || ''}
                    onChange={onChangeFechaHoraDenuncia}
                  />
                </Grid>

                <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    className='select'
                    select
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione la Dependencia: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("dependencia")}
                  >
                    {dependencias.map((item, i) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name} - {item.descripcion}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Divider variant="middle" sx={{ marginY: '20px', marginX: '0px', border: '1px solid #0000001f' }} />

              <Typography gutterBottom variant="subtitle" className='fw-bold color-gore'>
                DATOS DE LOS HECHOS
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <MapWrapper
                    location={[o.longitud ? o.longitud : -77.52888423325149, o.latitud ? o.latitud : -9.529897122270743]}
                    features={[]} onChange={(e) => {
                      o.longitud = e.lonLat[0];
                      o.latitud = e.lonLat[1];
                      o.lugarHecho = e.address;
                      //  set(o => ({ ...o, lugarHecho: e.address, longitud: e.lonLat[0], latitud: e.lonLat[1] }));
                    }} />
                </Grid>
                <Grid item xs={12} md={8} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    multiline
                    size="medium"
                    rows={4}
                    id="standard-name"
                    label="Ingrese el Lugar de los Hechos: "
                    placeholder="Lugar de los Hechos"
                    {...defaultProps("lugarHecho")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <DateTimePicker
                    required
                    renderInput={(props) => <TextField {...props} />}
                    label="Fecha y Hora del Hecho:"
                    value={o.fechaHoraHecho || ''}
                    onChange={onChangeFechaHoraHecho}
                  />
                  <TextField
                    hidden
                    style={{ display: 'none' }}
                    margin="normal"
                    required
                    size="medium"
                    {...defaultProps("latitud")}
                  />
                  <TextField
                    hidden
                    style={{ display: 'none' }}
                    margin="normal"
                    required
                    size="medium"
                    {...defaultProps("longitud")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione el Departamento: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("departamento")}
                  >
                    {departamentos.map((item, i) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione la Provincia: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("provincia", {
                      // onChange: onChangeTipoDocumento
                    })}
                  >
                    {provincias.filter(e => e.code.startsWith(o.departamento)).map((item, i) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione el Distrito: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("distrito", {
                    })}
                  >
                    {distritos.filter(e => e.code.startsWith(o.provincia)).map((item, i) => (
                      <MenuItem key={item.code} value={item.code}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Divider variant="middle" sx={{ marginY: '20px', marginX: '0px', border: '1px solid #0000001f' }} />

              <Typography gutterBottom variant="subtitle" className='fw-bold color-gore'>
                DATOS PERSONALES
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    type={'number'}
                    sx={{ fontWeight: 'bold' }}
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Número de Documento: "
                    placeholder="Ingrese el número de Documento."
                    onKeyUp={onKeyUpNroDocumento}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("dni")}
                  />
                </Grid>
                <Grid item xs={12} md={6} sx={{ paddingTop: '0px !important' }}>
                  <img alt="Foto" width={'20%'} src={o.foto ? 'data:image/png;base64, ' + o.foto : (process.env.PUBLIC_URL + "/male-female.jpg")} />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    disabled={disabled()}
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese su Apellido Paterno: "
                    placeholder="Apellido Paterno"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("apePaterno")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    disabled={disabled()}
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese su Apellido Materno: "
                    placeholder="Apellido Materno"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("apeMaterno")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    disabled={disabled()}
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese su Nombres Completos: "
                    placeholder="Nombres Completos"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("nombres")}
                  />
                </Grid>
                <Grid item xs={12} md={8} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    disabled={disabled()}
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ingrese sus Dirección: "
                    placeholder="Dirección"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("direccion")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <DesktopDatePicker
                    disabled={disabled()}
                    label="Ingrese su Fecha de Nacimiento."
                    inputFormat="DD/MM/YYYY"
                    value={o.fechaNacimiento || ''}
                    onChange={onChangeFechaNacimiento}
                    renderInput={(params) =>
                      <TextField
                        type={'number'}
                        sx={{ fontWeight: 'bold' }}
                        margin="normal"
                        required
                        fullWidth
                        id="standard-name"
                        label="Fecha de Nacimiento: "
                        placeholder="Ingrese su Fecha de Nacimiento."
                        // onKeyUp={onKeyUp}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Keyboard />
                            </InputAdornment>
                          ),
                        }}
                        {...params}
                      // {...defaultProps("fechaNacimiento")}
                      />}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    disabled={disabled()}
                    type={'number'}
                    sx={{ fontWeight: 'bold' }}
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Edad: "
                    placeholder="Ingrese el Edad."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("edad")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    disabled={disabled()}
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione su Género: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("sexo", {
                      // onChange: onChangeTipoDocumento
                    })}
                  >
                    {['Masculino', 'Femenino'].map((item, i) => (
                      <MenuItem key={'houseAccess_' + i} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    disabled={disabled()}
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    label="Seleccione su Estado Civil: "
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("estadoCivil", {
                    })}
                  >
                    {['Soltero(a)', 'Casado(a)', 'Conviviente', 'Viudo(a)'].map((item, i) => (
                      <MenuItem key={'houseAccess_' + i} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Divider variant="middle" sx={{ marginY: '20px', marginX: '0px', border: '1px solid #0000001f' }} />

              <Typography gutterBottom variant="subtitle" className='fw-bold color-gore'>
                CARACTERÍSTICAS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Tez: "
                    placeholder="Tez."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("tez")}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Fenotipo: "
                    placeholder="Fenotipo."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("fenotipo")}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Ojos: "
                    placeholder="Ojos."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("ojos")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Sangre: "
                    placeholder="Sangre."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("sangre")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Boca: "
                    placeholder="Boca."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("boca")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Nariz: "
                    placeholder="Nariz."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("nariz")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Cabello: "
                    placeholder="Cabello."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("cabello")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Estatura: "
                    placeholder="Estatura."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("estatura")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    size="medium"
                    id="standard-name"
                    label="Contextura: "
                    placeholder="Contextura."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...defaultProps("contextura")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    multiline
                    size="medium"
                    rows={4}
                    id="standard-name"
                    label="Ingrese la Vestimenta: "
                    placeholder="Vestimenta"
                    {...defaultProps("vestimenta")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    multiline
                    size="medium"
                    rows={4}
                    id="standard-name"
                    label="Ingrese las Circunstancias: "
                    placeholder="Circunstancias"
                    {...defaultProps("circunstancia")}
                  />
                </Grid>
                <Grid item xs={12} md={4} sx={{ paddingTop: '0px !important' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    multiline
                    size="medium"
                    rows={4}
                    id="standard-name"
                    label="Ingrese las Observaciónes: "
                    placeholder="Observación"
                    {...defaultProps("observacion")}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#0f62ac' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>
      </form>
    </ThemeProvider></LocalizationProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}