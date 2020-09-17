import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {

	// explore the socket functions

	private client: SocketIOClient.Socket;

	constructor(private auth: AuthService) {
		this.client = io(environment.serverUrl, { query: { username : auth.user.username } });
	}

	sendGlobal(text: string, join?: boolean, left?: boolean): boolean {
		text = text[0].toUpperCase() + text.slice(1);
		const type = join ? 'join' : left ? 'left' : 'default';

		const message: Message = {
			date: this.getTimestamp(),
			text,
			username: this.auth.user.username,
			type
		};
		this.client.emit('toServer', message);
		console.log(this.client.id);
		return true;
	}

	receiveGlobal(): Observable<Message> {
		return Observable.create(observer => {
			this.client.on('toClient', (message: Message) => {
			  	observer.next(message);
			});
		});
	}

	sendPersonal(text: string, receiverUsername: string): void {
		text = text[0].toUpperCase() + text.slice(1);
		this.client.emit('c2c', {
			username: receiverUsername,
			text,
			date: this.getTimestamp(),
			type: 'default'
		});
	}

	receivePersonal(): Observable<Message> {
		return Observable.create(observer => {
			this.client.on('c2c', (message: Message) => {
			  	observer.next(message);
			});
		});
	}

	getTimestamp(): string {
		const date: Date = new Date();
		return `${date.getUTCHours()}:${date.getUTCMinutes()} UTC`;
	}

}
