import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectFilter'
})
export class ProjectFilterPipe implements PipeTransform {
  transform(projects: any[], search: string): any[] {
    if (!projects) return [];
    if (!search) return projects;
    const term = search.toLowerCase();
    return projects.filter(p => p.name && p.name.toLowerCase().includes(term));
  }
}
