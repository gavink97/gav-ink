import { animate, hover, press } from 'motion';

function fetchTableData(primary = 'date', order = 'asc'): void {
	const uri = '/component/open-source-table';
	const url = `${uri}?primary=${primary}&order=${order}`;

	fetch(url)
		.then((res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			return res.text();
		})
        .then((html) => {
            // this is such a hack, should update styles directly from the server not like this
            const projectsTable = document.getElementById('open-source-projects');
            const temp = document.createElement('div');
            temp.innerHTML = html

            const newNodes = Array.from(temp.children)

            projectsTable.style.gridTemplateRows = `repeat(${newNodes.length + 2}, 1fr)`

            while (projectsTable.childElementCount > 2) {
                projectsTable.removeChild(projectsTable.children[1])
            }

            const last = projectsTable.lastElementChild as HTMLLIElement
            last.style.gridRow = `${newNodes.length + 2}`

            let int = 0
            for (const node of newNodes) {
                projectsTable.children[int].after(node)
                int++
            }

            projectEffectListener()
        })
		.catch((err) => {
			console.error('Error fetching modal:', err);
		});
}

function projectEffectListener(): void {
    const project = document.getElementsByClassName("project")
    if (project.length === 0) {
        return
    }

    for (const row of project) {
        const name = row.getAttribute("data-project-name")
        const id = `${name}-preview`
        const divId = "project-previews"

        if (!document.getElementById(id)) {
            const img = document.createElement("img")
            let div = document.getElementById(divId)

            if (!div) {
                div = document.createElement("div")

                Object.assign(div, <HTMLDivElement> {
                    id: divId,
                    role: "region",
                    ariaLabel: "Project previews"
                })
            }

            Object.assign(img, {
                src: `/public/images/${name}.avif`,
                alt: `${name} preview`,
                loading: "lazy",
                id: id
            })

            Object.assign(img.style, <CSSStyleDeclaration> {
                opacity: "0",
                position: "fixed",
                zIndex: "10",
                bottom: "20rem",
                right: "20rem",
                width: "10rem",
            })

            div.appendChild(img)
            document.body.appendChild(div)
        }

        hover(row, () => {
            animate(`#${id}`, { opacity: 100 }, { duration: 0.5 });

            return () => {
                animate(`#${id}`, { opacity: 0 }, { duration: 0.5 });
            };
        });
    }
}

function tableKeyListener(): void {
    const projectButton = document.getElementById('table-button-project');
    const dateButton = document.getElementById('table-button-date');
    const stargazersButton = document.getElementById('table-button-stargazers');
    if (!projectButton || !dateButton || !stargazersButton) {
        console.error("An unexpected error occured")
    }

    // add an icon that indictates sort direction
    for (const button of [projectButton, dateButton, stargazersButton]) {
		press(button, () => {
            const table = document.getElementById('open-source-projects')
			const order = table.getAttribute('data-column-order') || '';
			const active = table.getAttribute('data-column-active') || '';
            let direction = 'asc'

            if (button.id === active) {
                if (order === 'asc') {
                    direction = 'dsc'
                } else {
                    direction = 'asc'
                }
            }

            table.setAttribute('data-column-active', button.id)
            table.setAttribute('data-column-order', direction)

			switch (button.id) {
				case 'table-button-project':
					fetchTableData('name', direction);
					break;

				case 'table-button-date':
					fetchTableData('date', direction);
					break;

				case 'table-button-stargazers':
					fetchTableData('stargazers', direction);
					break;

				default:
					fetchTableData('date', direction);
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTableData('date');
    tableKeyListener();
});
