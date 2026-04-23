import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
// Lm: este import de aqui es porque me salia un error en el html a la hora de usar las fechas
import { DatePipe } from '@angular/common';


//Lm: importamos los modulos de angular material que vamos a ocupar
//Lm: Todos estos modulos son los mismos de la actividad de ejemplo
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
//Lm: estos modulos son nuevas añadiciones 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

//Lm: Usamos un interfac para definir la estrucutra de la Actividad (esto es igual que el ejemplo)
interface Actividad {
  id: number;
  nombre: string; //Lm: Creo que el de la actividad se llamaba titulo
  materia: string;
  fechaEntrega: string; //Lm: añadimos la fecha de entrega que es un requisito
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: boolean; //Lm: Aqui definimos el estado de la actividad (Esto tambien es un requisito)
}

type FiltroEstado = 'todas' | 'pendientes' | 'completadas'; //Lm: Vamos a ocupar el mismo fltro que el del ejemplo

@Component({
  selector: 'app-root',
  standalone: true, //Lm: Esto lo copiamos de la actividad anterior
  imports: [FormsModule,  //Lm: importamos los modulos para usar las etiquetas
    DatePipe,
    MatToolbarModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatSelectModule, 
    MatButtonModule, 
    MatChipsModule,
     MatListModule,
    MatCheckboxModule, 
    MatDividerModule, 
    MatIconModule, 
    //Lm: hasta aqui todo es igual, solo añadimos dos import's mas que son de los dos modulos que agregue extra
    MatDatepickerModule, 
    MatNativeDateModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Gestor de Actividades Académicas');

  //Lm: Aqui vamos a almacenar temporalmente los datos que introduzca el usuario (Extraido de la actividad anterior)
  nuevoNombre = '';
  nuevaMateria = '';
  nuevaFecha = '';
  nuevaPrioridad: 'Alta' | 'Media' | 'Baja' = 'Media';

  filtroActual = signal<FiltroEstado>('todas');

  //Lm: Creamos la lsita de actividades vacias por ahora
  actividades = signal<Actividad[]>([]);

  //Lm: Le asignamos un id a cualquier nueva actividad que se genere (empezamos en 1 porque no hay actividades creadas)
  private siguienteId = 1;  

  //Lm: este computed calcula las actividades cada que se actualicen
  totalActividades = computed(() => this.actividades().length);

  //Lm: Estos dos computed hacen el calculo de las actividades pendientes y completadas 
  totalPendientes = computed(() => this.actividades().filter(a => !a.estado).length);
  totalCompletadas = computed(() => this.actividades().filter(a => a.estado).length);

  //Lm: Aqui se muestran las actividades segun el filtro
  actividadesFiltradas = computed(() => {
    //Lm: Hacemos lo mismo que en la actividad pasada: guardar el filtro actual y la lista de tareas
    const filtro = this.filtroActual();
    const lista = this.actividades();

    //Lm: Dependiendo del valor del filtro seleccionado se mostrar una lista u otra
    if (filtro === 'pendientes') return lista.filter(a => !a.estado); //Lm: cuando el estado de las actividades sea pendientes
    if (filtro === 'completadas') return lista.filter(a => a.estado); //Lm: cuando el estado de las actividades sea completadas
    //Lm: si no se selecciono ningun filtro devolvemos la lista original que tiene el filtro "todas", ya que asi lo definimos al inicio (linea 65)
    return lista;
  });

  //Lm: Funcion para agregar una nueva actividad
  agregarActividad(): void {

    //Lm: Al igual que en la actividad eliminamos espacios vacios al inicio y al final
    const nombre = this.nuevoNombre.trim();   
    const materia = this.nuevaMateria.trim();
    const fecha = this.nuevaFecha;

    // Lm: Misma validacion: Si alguno de los campos esta vacio se detiene la funcion
    if (!nombre || !materia || !fecha) {
      //Lm: añadimos un mensaje ya que la actividad anterior no lo tenia y no se sabia porque no se agregaba la actividad 
      //(era obvio que porque estaba vacia pero se sentia raro ver que no hacia nada)
      alert('Rellena todos los campos para agregar la Actividad.');
      return;
    }

    // Lm: aqui creamos la nueva actividad
    const nuevaActividad: Actividad = {
      id: this.siguienteId++,
      nombre,
      materia,
      fechaEntrega: fecha,
      prioridad: this.nuevaPrioridad,
      estado: false //Lm: el estado false indica que no esta competada, y como se acaba de crear obvio va a estar pendiente
    };

    // Lm: esta linea inserta la nueva actividad al inicio de la lista
    this.actividades.update(lista => [nuevaActividad, ...lista]);

    // Lm: Igual que en la otra actividad limpiamos las entradas de datos
    this.nuevoNombre = '';
    this.nuevaMateria = '';
    this.nuevaFecha = '';
    this.nuevaPrioridad = 'Media';
  }

  // Lm: Esto hace que la actividad cambie de estado entre pendiente y completada (le mentiria si le digo que se como lo hace)
  toggleActividad(id: number): void {
    this.actividades.update(lista =>
      lista.map(a => a.id === id ? { ...a, estado: !a.estado } : a)
    );
  }

  // Lm: Aqui usamos la misma funcion para eliminar actividades que en la actividad anterior
  eliminarActividad(id: number): void {
    this.actividades.update(lista => lista.filter(a => a.id !== id));
  }

  // Lm: COn esto cambiamos el filtro y se recalcula el signal
  cambiarFiltro(filtro: FiltroEstado): void {
    this.filtroActual.set(filtro);
  }


  // Lm: Esta funcion nos devuelve una clase segun la prioridad de la actividad, esto es para cambiar el estilo del chip 
  obtenerClasePrioridad(prioridad: Actividad['prioridad']): string {
    switch (prioridad) {
      case 'Alta': return 'chip-alta';
      case 'Media': return 'chip-media';
      case 'Baja': return 'chip-baja';
      default: return '';
    }
}    
}
