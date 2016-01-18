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
    </div>
    <a (click)="clicked($event)" class="div-link">Select</a>
  </div>
  `
})
class ChatThread implements OnInit {
  thread: Thread;
  selected: boolean = false;

  constructor(public threadsService: ThreadsService) {
  }

  ngOnInit(): void {
    this.threadsService.currentThread
      .subscribe( (currentThread: Thread) => {
        this.selected = currentThread &&
          this.thread &&
          (currentThread.id === this.thread.id);
      });
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
      text: `Hello`,
      thread: newThread
    });

    this.messagesService.addMessage(newMessage)
  }
}
