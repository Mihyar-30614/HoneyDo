import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
	transform(array: any[], field: string[], order: string[]): any[] {
		if (!Array.isArray(array)) {
			return array;
		}

		return [...array].sort((a, b) => {
			const aIndex = order.indexOf(a[field[0]]);
			const bIndex = order.indexOf(b[field[0]]);
			return aIndex - bIndex;
		});
	}
}
