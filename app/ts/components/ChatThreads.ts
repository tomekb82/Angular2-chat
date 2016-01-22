import {
  Component,
  OnInit,
  ChangeDetectionStrategy

} from 'angular2/core';
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Control, AbstractControl} from 'angular2/common';
import {UserService, ThreadsService, MessagesService} from '../services/services';
import {Observable} from 'rxjs';
import {User, Thread, Message} from '../models';
import * as moment from 'moment';

@Component({
  inputs: ['thread'],
  selector: 'chat-thread',
  template: `
 
  <a (click)="delete($event)" class="close_thread">
    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
  </a>
  <div class="media conversation">
    <div class="pull-left">
      <img class="media-object avatar" 
           src="{{thread.avatarSrc}}">
    </div>

    <div class="media-body">
      <h5 class="media-heading contact-name">{{thread.name}}
        <span *ngIf="selected">&bull;</span>        
      </h5>  
      <small class="message-preview">{{thread.lastMessage.text}}</small>
      <a (click)="clicked($event)" class="div-link">Select</a>
    </div>
  </div>
  `
})
class ChatThread implements OnInit {
  thread: Thread;
  selected: boolean = false;

  constructor(public threadsService: ThreadsService,public messagesService: MessagesService) {
  }

  ngOnInit(): void {
    this.threadsService.currentThread
      .subscribe( (currentThread: Thread) => {
        this.selected = currentThread &&
          this.thread &&
          (currentThread.id === this.thread.id);
      });
this.threadsService.deletedThread.subscribe(this.messagesService.delete);   
  }

  delete(event): void {
    this.threadsService.setDeletedThread(this.thread);
    this.messagesService.messages
      .subscribe( (messages: Message[]) => {
        messages.map((message: Message) => {
          console.log(message.text);
        });
      });
     event.preventDefault();
  }

  clicked(event: any): void {
    this.threadsService.setCurrentThread(this.thread);
    event.preventDefault();
  }
}


@Component({
  selector: 'chat-threads',
  directives: [ChatThread, FORM_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPushObserve,
  template: `
    <!-- conversations -->
    <div class="row">
      <div class="conversation-wrap">

        <chat-thread
             *ngFor="#thread of threads | async"
             [thread]="thread">
        </chat-thread>
      </div>
    </div>

    <div class="row">
    <div class="conversation-wrap">
     <h2>Add a new thread</h2>
        <form [ngFormModel]="myForm" (submit)="onSubmit($event, myForm.value)">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text"
               class="form-control"
               id="name"
               placeholder="Username"
               ngControl="name">
          </div>
          <button type="submit" class="btn btn-default">Add thread</button>
        </form>
        </div>
    </div>
  `
})
export class ChatThreads {
  myForm: ControlGroup;
  name: AbstractControl;

  threads: Observable<any>;

  constructor(public threadsService: ThreadsService, public messagesService:MessagesService, fb: FormBuilder) {
    this.threads = threadsService.orderedThreads;

    this.myForm = fb.group({
      "name": [""]
    });
    this.name = this.myForm.controls['name'];
  }

  onSubmit(event, value) {
    event.preventDefault();

    let newUser: User      = new User(value.name, require('images/avatars/male-avatar-3.png'));
    let newThread: Thread = new Thread('t' + newUser.name , newUser.name, newUser.avatarSrc);
    let newMessage:Message = new Message({
      author: newUser,
      sentAt: moment().subtract(0, 'minutes').toDate(),
      text: `Hello, my name is ` + newUser.name,
      thread: newThread
    });

    this.messagesService.addMessage(newMessage);

    this.messagesService.messagesForThreadUser(newThread, newUser)
      .forEach( (message: Message): void => {
        this.messagesService.addMessage(
          new Message({
            author: newUser,
            text: 'What do you mean by ' + message.text.split('').join(',') + ' ?',
              thread: newThread
          })
        );
      },
      null);

  }
}
