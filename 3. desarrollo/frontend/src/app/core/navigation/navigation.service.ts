import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { OpcioController } from 'app/modules/admin/confi/parameter/opcio/infrastructure/controller/controller';
import { Observable, ReplaySubject, tap, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _opcioController = inject(OpcioController);
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    get(): Observable<Navigation> {
        return this._opcioController.findAll({ page: 1, pageSize: 10, all: "*" }).pipe(
            map((res) => {
                const rawOpciones = res.data;
                const fuseNavItems = this.mapOpcioToFuseNav(rawOpciones);
                const navigation: Navigation = {
                    compact: fuseNavItems,
                    default: fuseNavItems,
                    futuristic: fuseNavItems,
                    horizontal: fuseNavItems
                };
                this._navigation.next(navigation);
                return navigation;
            })
        );
    }

    private mapOpcioToFuseNav(items: any[]): FuseNavigationItem[] {
        return items.map((item) => {
            const hasChildren = Array.isArray(item.opcio_men_opcio) && item.opcio_men_opcio.length > 0;
            
            // Validar y sanitizar la ruta para evitar errores con rutas relativas
            let link: string | undefined = undefined;
            if (!hasChildren && item.opcio_www_opcio) {
                const route = item.opcio_www_opcio.trim();
                // Si la ruta contiene '../', es inválida - usar ruta absoluta
                if (route.includes('../')) {
                    console.warn(`Ruta inválida detectada en opción ${item.opcio_cod_opcio}: ${route}. Se omitirá.`);
                    link = undefined;
                } else if (route && !route.startsWith('/')) {
                    // Si no empieza con '/', agregarlo para hacerla absoluta
                    link = `/${route}`;
                } else {
                    link = route || undefined;
                }
            }
            
            const navItem: FuseNavigationItem = {
                id: item.opcio_cod_opcio,
                title: item.opcio_des_opcio,
                type: hasChildren ? 'collapsable' : 'basic',
                icon: item.icons_cod_html ? `heroicons_outline:${item.icons_cod_html}` : 'heroicons_outline:square-3-stack-3d', // ícono por defecto
                link: link,
                children: hasChildren ? this.mapOpcioToFuseNav(item.opcio_men_opcio) : undefined,
            };

            return navItem;
        });
    }
}
