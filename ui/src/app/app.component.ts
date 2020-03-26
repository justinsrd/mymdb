import {Component} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {MyServiceService} from './my-service.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [MyServiceService]
})
export class AppComponent {
    public title: string = 'Community';
    public imdbId: string = 'tt0386676';
    private currentSeasons: number;
    private zoomYAxis: boolean = false;
    public chart: any = new Chart({
        chart: {
            type: 'scatter',
            animation: true,
            backgroundColor: '#333333'
        },
        xAxis: {
            visible: false,
            tickWidth: 0
        },
        yAxis: {
            gridLineColor: '#424242',
            // min: 0,
            // max: 10
        },
        legend: {
            enabled: false
        },
        title: {
            text: '',
            style: {
                color: '#fff'
            }
        },
        credits: {
            enabled: false
        },
        series: [],
        tooltip: {
            useHTML: true,
            formatter: function() {
                const episode = this.point.episode;
                return `
                    <div class="tooltip-container">
                        <p class="episode-title font-weight-bold">${episode.episode_title}</p>
                        <p class="episode-number">${episode.seriesNumber}</p>
                        <p class="episode-rating">Rating: <span class="value font-weight-bold">${Number(episode.rating).toFixed(1)}</span></p>
                        <p class="episode-votes">Votes: </span class="value">${episode.votes}</span></p>
                    </div>
                `;
            }
        }
    });

    constructor(private myServiceService: MyServiceService) {

    }

    findColor(index: number) {
        const colors = ['#7ed1f0', '#f1ef85', '#cb78ed', '#7ff2ad', '#ef857c', '#80f2ea', '#7b8eed', '#b5f284', '#f079d3'];
        while (index > colors.length) {
            index -= colors.length;
        }
        return colors[index];
    }

    formatSeriesNumber(episode: any) {
        let str = 's';
        str += episode.season < 10 ? '0' + episode.season : episode.season;
        str += 'e';
        str += episode.episode < 10 ? '0' + episode.episode : episode.episode;
        return str;
    }

    switchy() {
        this.zoomYAxis = !this.zoomYAxis;
        if (this.zoomYAxis) {
            // const min = Math.max(Math.floor(this.chart.ref.yAxis[0].dataMin)-1, 0);
            // const max = Math.min(Math.ceil(this.chart.ref.yAxis[0].dataMax)+1, 10);
            // const min = Math.floor(this.chart.ref.yAxis[0].dataMin);
            // const max = Math.ceil(this.chart.ref.yAxis[0].dataMax);
            const min = this.chart.ref.yAxis[0].dataMin - .1;
            const max = this.chart.ref.yAxis[0].dataMax + .1;
            this.chart.ref.yAxis[0].setExtremes(min, max, true, true);
        } else {
            this.chart.ref.yAxis[0].setExtremes(0, 10);
        }
    }


    fetchStuff() {
        const self = this;
        if (this.title) {
            this.myServiceService.getData(this.title).subscribe((res: any) => {
                res = res.show_data;
                if (res && Object.keys(res).length) {
                    if (res && Object.keys(res).length) {
                        self.renderChart(res);
                    }
                }
            }, (err: any) => {
                console.log('err', err);
            });
        }
    }






    fetchStuffByImdbId(): void {
        const self = this;
        if (this.imdbId) {
            this.myServiceService.getDataByImdbId(this.imdbId).subscribe((res: any) => {
                res = res.show_data;
                if (res && Object.keys(res).length) {
                    self.renderChart(res);
                }
            }, (err: any) => {
                console.log('err', err);
            });
        }
    }

    renderChart(data): void {
        const self = this;
        for (let i = self.currentSeasons; i >= 0; i--) {
            self.chart.removeSerie(i);
        }
        if (data.length) {
            self.chart.ref.setTitle({text: data[0].name});
        }
        let ct = 0;
        const seasonMap: any = {};
        data.forEach((episode: any) => {
            if (!seasonMap[episode.season]) {
                seasonMap[episode.season] = [];
            }
            seasonMap[episode.season].push(episode);
        });
        self.currentSeasons = Object.keys(seasonMap).length;
        // this.zoomYAxis = false;
        // this.chart.ref.yAxis[0].setExtremes(0, 10, true, true);

        Object.keys(seasonMap).forEach((season: any) => {
            const data = seasonMap[season].map((episode) => {
                episode.seriesNumber = self.formatSeriesNumber(episode);
                return {
                    x: ++ct,
                    y: episode.rating,
                    episode: episode
                }
            });
            self.chart.addSerie({
                name: `Season ${season}`,
                data: data,
                marker: {
                    fillColor: self.findColor(season - 1),
                    symbol: 'circle'
                }
            });
        });
    }
}
